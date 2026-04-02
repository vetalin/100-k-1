import React, { useState, useEffect } from 'react';
import bridge, { BannerAdLocation } from '@vkontakte/vk-bridge';
import {
  ConfigProvider,
  platform,
  AppRoot,
  Epic,
  View,
  Panel,
  PanelHeader,
  Tabbar,
  TabbarItem,
  ColorSchemeType,
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

import { Icon28GameOutline, Icon28UsersOutline, Icon28UserCircleOutline } from '@vkontakte/icons';

import { GameProvider, useGame } from './store/GameContext';
import { QuestProvider, useQuests } from './store/QuestContext';
import { SeasonProvider } from './store/SeasonContext';
import QuestsScreen from './panels/QuestsScreen';
import SeasonScreen from './panels/SeasonScreen';
import ChallengeModal from './components/ChallengeModal';
import { parseChallengeFromSearch, ChallengeParams } from './utils/challenge';
import { UserProvider, useUser } from './store/UserContext';
import { AchievementProvider } from './store/AchievementContext';
import { TournamentProvider } from './store/TournamentContext';
import { SettingsProvider } from './store/SettingsContext';

import StartScreen from './panels/StartScreen';
import GameScreen from './panels/GameScreen';
import RoundResult from './panels/RoundResult';
import FinalResult from './panels/FinalResult';
import ReviewScreen from './panels/ReviewScreen';
import MiniRoundScreen from './panels/MiniRoundScreen';
import TournamentResult from './panels/TournamentResult';
import Leaderboard from './panels/Leaderboard';
import Categories from './panels/Categories';
import Profile from './panels/Profile';

import './App.css';
import OnboardingGuide from './components/OnboardingGuide';

type ActivePanel = 'start' | 'game' | 'round_result' | 'final_result' | 'tournament_result' | 'leaderboard' | 'categories' | 'profile' | 'review' | 'mini_round' | 'quests' | 'season';

const App: React.FC = () => {
  const [activePanel, setActivePanel] = useState<ActivePanel>('start');
  const [activeStory, setActiveStory] = useState('home');
  const [miniRoundQuestions, setMiniRoundQuestions] = useState<import('./types/index').Question[]>([]);
  const [pendingChallenge, setPendingChallenge] = useState<ChallengeParams | null>(null);
  const [colorScheme, setColorScheme] = useState<ColorSchemeType | undefined>(undefined);
  const { fetchUser, stats } = useUser();
  const { dispatch } = useGame();
  const { initQuests } = useQuests();

  useEffect(() => {
    bridge.subscribe((e: any) => {
      if (e.detail.type === 'VKWebAppUpdateConfig') {
        setColorScheme(e.detail.data.appearance);
      }
    });
  }, []);

  useEffect(() => {
    fetchUser();
    bridge.send('VKWebAppShowBannerAd', { banner_location: BannerAdLocation.BOTTOM });
    // Check for incoming challenge
    const challenge = parseChallengeFromSearch();
    if (challenge) setPendingChallenge(challenge);
  }, []);

  useEffect(() => {
    if (stats) {
      initQuests(stats.streak ?? 0);
    }
  }, [stats?.streak]);

  const handleStoryChange = (story: string) => {
    setActiveStory(story);
    if (story === 'home') setActivePanel('start');
    else if (story === 'leaderboard') setActivePanel('leaderboard');
    else if (story === 'profile') setActivePanel('profile');
  };

  const goToPanel = (panel: ActivePanel) => {
    setActivePanel(panel);
    // Always stay in home story for game flow panels
    setActiveStory('home');
  };

  const [onboardingDone, setOnboardingDone] = useState(false);

  const handleAcceptChallenge = () => {
    if (!pendingChallenge) return;
    dispatch({ type: 'START_GAME', category: pendingChallenge.category as any });
    setPendingChallenge(null);
    goToPanel('game');
  };

  return (
    <>
      {!onboardingDone && <OnboardingGuide onComplete={() => setOnboardingDone(true)} />}
      {pendingChallenge && (
        <ChallengeModal
          challenge={pendingChallenge}
          onAccept={handleAcceptChallenge}
          onDecline={() => setPendingChallenge(null)}
        />
      )}
      <ConfigProvider platform={platform()} colorScheme={colorScheme}>
        <AppRoot mode="embedded">
        <Epic activeStory={activeStory} tabbar={
          <Tabbar>
            <TabbarItem
              onClick={() => handleStoryChange('home')}
              selected={activeStory === 'home'}
              label="Главная"
            >
              <Icon28GameOutline />
            </TabbarItem>
            <TabbarItem
              onClick={() => handleStoryChange('leaderboard')}
              selected={activeStory === 'leaderboard'}
              label="Рейтинг"
            >
              <Icon28UsersOutline />
            </TabbarItem>
            <TabbarItem
              onClick={() => handleStoryChange('profile')}
              selected={activeStory === 'profile'}
              label="Профиль"
            >
              <Icon28UserCircleOutline />
            </TabbarItem>
          </Tabbar>
        }>
          {/* Home story: game flow panels */}
          <View id="home" activePanel={activePanel}>
            <Panel id="start">
              <PanelHeader transparent shadow={false}>100 к 1</PanelHeader>
              <StartScreen onStartGame={() => goToPanel('game')} onOpenLeaderboard={() => handleStoryChange('leaderboard')} onOpenQuests={() => goToPanel('quests')} />
            </Panel>
            <Panel id="game">
              <PanelHeader transparent shadow={false} delimiter="none">Вопрос</PanelHeader>
              <GameScreen onRoundEnd={() => goToPanel('round_result')} />
            </Panel>
            <Panel id="round_result">
              <PanelHeader transparent shadow={false}>Результат</PanelHeader>
              <RoundResult onNextRound={() => goToPanel('game')} onFinalResult={() => goToPanel('final_result')} />
            </Panel>
            <Panel id="final_result">
              <PanelHeader transparent shadow={false}>Итоги</PanelHeader>
              <FinalResult onPlayAgain={() => goToPanel('start')} onLeaderboard={() => handleStoryChange('leaderboard')} onReview={() => goToPanel('review')} />
            </Panel>
            <Panel id="review">
              <PanelHeader transparent shadow={false}>Разбор ошибок</PanelHeader>
              <ReviewScreen
                onBack={() => goToPanel('final_result')}
                onMiniRound={(qs) => { setMiniRoundQuestions(qs); goToPanel('mini_round'); }}
              />
            </Panel>
            <Panel id="mini_round">
              <PanelHeader transparent shadow={false}>Мини-раунд</PanelHeader>
              <MiniRoundScreen
                questions={miniRoundQuestions}
                onFinish={() => goToPanel('review')}
              />
            </Panel>
            <Panel id="quests">
              <PanelHeader transparent shadow={false}>Задания дня</PanelHeader>
              <QuestsScreen onBack={() => goToPanel('start')} />
            </Panel>
            <Panel id="season">
              <SeasonScreen onBack={() => goToPanel('start')} />
            </Panel>
            <Panel id="tournament_result">
              <PanelHeader transparent shadow={false}>Результаты турнира</PanelHeader>
              <TournamentResult onViewProfile={() => handleStoryChange('profile')} onNewTournament={() => goToPanel('start')} />
            </Panel>
            <Panel id="categories">
              <PanelHeader transparent shadow={false}>Категории</PanelHeader>
              <Categories onSelectCategory={() => goToPanel('game')} />
            </Panel>
          </View>

          {/* Leaderboard story */}
          <View id="leaderboard" activePanel="leaderboard_main">
            <Panel id="leaderboard_main">
              <PanelHeader transparent shadow={false}>Рейтинг</PanelHeader>
              <Leaderboard />
            </Panel>
          </View>

          {/* Profile story */}
          <View id="profile" activePanel="profile_main">
            <Panel id="profile_main">
              <PanelHeader transparent shadow={false}>Профиль</PanelHeader>
              <Profile />
            </Panel>
          </View>
        </Epic>
      </AppRoot>
      </ConfigProvider>
      </>
    );
};

const AppWrapper: React.FC = () => (
  <UserProvider>
    <GameProvider>
      <SettingsProvider>
        <AchievementProvider>
        <TournamentProvider>
        <QuestProvider>
        <SeasonProvider>
          <App />
        </SeasonProvider>
        </QuestProvider>
        </TournamentProvider>
      </AchievementProvider>
      </SettingsProvider>
    </GameProvider>
  </UserProvider>
);

export default AppWrapper;
