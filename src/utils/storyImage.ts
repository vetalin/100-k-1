// Canvas-based story image generator for VK Stories sharing

interface StoryOptions {
  userName: string;
  userAvatarUrl: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  bestPercent: number;
  streak: number;
  isTournament: boolean;
  tournamentMultiplier: number;
}

export async function generateStoryImage(options: StoryOptions): Promise<string> {
  const { userName, userAvatarUrl, score, correctAnswers, totalQuestions, bestPercent, streak, isTournament, tournamentMultiplier } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = 1080;
  canvas.height = 1920;

  // Background gradient
  const bgGradient = ctx.createLinearGradient(0, 0, 0, 1920);
  bgGradient.addColorStop(0, '#1a237e');
  bgGradient.addColorStop(0.5, '#4a148c');
  bgGradient.addColorStop(1, '#0d47a1');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 1080, 1920);

  // Decorative circles
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(900, 200, 300, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // App logo / emoji
  ctx.font = '160px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎯', 540, 300);

  // Title
  ctx.font = 'bold 64px sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.fillText('100 к 1', 540, 420);

  if (isTournament) {
    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`🏆 Турнир ×${tournamentMultiplier}`, 540, 500);
  }

  // Avatar circle placeholder (white ring)
  const avatarX = 540;
  const avatarY = 720;
  const avatarR = 140;
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarR + 10, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
  ctx.fillStyle = '#3f51b5';
  ctx.fill();

  // Try to load user avatar
  try {
    const avatarImg = await loadImage(userAvatarUrl);
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
    ctx.clip();
    const scale = (avatarR * 2) / Math.max(avatarImg.width, avatarImg.height);
    const dw = avatarImg.width * scale;
    const dh = avatarImg.height * scale;
    ctx.drawImage(avatarImg, avatarX - dw / 2, avatarY - dh / 2, dw, dh);
    ctx.restore();
  } catch (e) {
    // Draw user icon if avatar fails
    ctx.font = '120px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('👤', avatarX - 60, avatarY + 45);
  }

  // User name
  ctx.font = 'bold 56px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(userName, 540, 940);

  // Score card
  drawCard(ctx, 90, 1000, 900, 280, 'rgba(255,255,255,0.15)');
  ctx.font = 'bold 120px sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(score.toLocaleString('ru-RU'), 540, 1180);
  ctx.font = '48px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('очков', 540, 1240);

  // Stats row
  const statsY = 1380;
  const statW = 280;
  const stats = [
    { emoji: '✅', label: 'Верных', value: `${correctAnswers}/${totalQuestions}` },
    { emoji: '💯', label: 'Лучший', value: `${bestPercent}%` },
    { emoji: '🔥', label: 'Серия', value: `${streak} дней` },
  ];

  stats.forEach((stat, i) => {
    const x = 90 + i * statW + statW / 2;
    drawCard(ctx, 90 + i * statW + 10, statsY, statW - 20, 200, 'rgba(255,255,255,0.1)');
    ctx.font = '56px sans-serif';
    ctx.fillText(stat.emoji, x, statsY + 70);
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(stat.value, x, statsY + 140);
    ctx.font = '32px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(stat.label, x, statsY + 175);
    ctx.fillStyle = '#FFFFFF';
  });

  // CTA
  ctx.font = 'bold 56px sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.fillText('Проверь себя в 100 к 1!', 540, 1700);
  ctx.font = '40px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('vk.com/app0', 540, 1780);

  // Watermark
  ctx.font = '32px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText('Создано в 100 к 1 VK Mini App', 540, 1880);

  return canvas.toDataURL('image/jpeg', 0.85);
}

function drawCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  const r = 24;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
