import { AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { resolve } from 'path';

GlobalFonts.registerFromPath(
  resolve('src/resources/fonts/RussoOne.ttf'),
  'RUSSOONE'
);

export class WelcomeCard {
  constructor() {
    this.avatar = {
      src: 'https://cdn.discordapp.com/embed/avatars/0.png',
      border: '#fff',
    };
    this.background = {
      type: 'color',
      src: '#191919',
    };
    this.title = this.initTextConfig('Welcome', '#fff', 'RUSSOONE', 60);
    this.username = this.initTextConfig('Unknown', '#fff', 'RUSSOONE', 40);
    this.description = this.initTextConfig('', '#fff', 'RUSSOONE', 25);
    this.overlay = 0;
  }

  initTextConfig(data, color, font, size) {
    return { data, color, font, size };
  }

  setBackground(type, value) {
    this.background.type =
      type === 'image' && /\.(jpg|jpeg|png)$/.test(value) ? 'image' : 'color';
    this.background.src =
      (type === null || type === 'color') &&
      /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(value)
        ? value
        : this.background.src;
    if (
      type === 'image' &&
      /^(http(s?):)|([/|.|\w|\s])*\.(?:jpg|jpeg|png)/.test(value)
    ) {
      this.background.src = value;
    }
    return this;
  }

  setAvatar(value, border) {
    this.avatar.border = /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(border)
      ? border
      : this.avatar.border;
    this.avatar.src = value || this.avatar.src;
    return this;
  }

  setTitle(value, color) {
    this.title.color = /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)
      ? color
      : this.title.color;
    this.title.data = value || this.title.data;
    return this;
  }

  setUsername(value, color) {
    this.username.color = /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)
      ? color
      : this.username.color;
    this.username.data = value || this.username.data;
    return this;
  }

  setDescription(value, color) {
    this.description.color = /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)
      ? color
      : this.description.color;
    this.description.data = value || this.description.data;
    return this;
  }

  setOverlay(value) {
    this.overlay = /^[0-9]*[.][0-9]+$/.test(value) ? value : 0;
    return this;
  }

  async createImage() {
    const canvas = createCanvas(1024, 500);
    const ctx = canvas.getContext('2d', { alpha: false });

    await this.drawBackground(ctx, canvas);

    this.drawRoundedImageWithShadow(
      ctx,
      await loadImage(this.avatar.src, { alt: 'Background Image' }),
      (canvas.width - 250) / 2,
      45,
      250,
      250,
      125,
      this.avatar.border,
      8,
      'black',
      10
    );

    if (this.title.data.trim().length !== 0) {
      this.drawText(ctx, this.title, 350, canvas);
    }

    if (this.username.data.trim().length !== 0) {
      this.drawText(ctx, this.username, 400, canvas);
    }

    if (this.description.data.trim().length !== 0) {
      this.drawText(ctx, this.description, 440, canvas);
    }

    const outputBuffer = await canvas.toBuffer('image/png', { quality: 100 });
    return new AttachmentBuilder(outputBuffer, { name: 'welcome.png' });
  }

  async drawBackground(ctx, canvas) {
    ctx.beginPath();
    ctx.fillStyle =
      this.background.type === 'color' ? this.background.src : '#191919';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (this.background.type === 'image') {
      try {
        const background = await loadImage(this.background.src);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      } catch (err) {
        console.log(err);
      }
    }

    ctx.fillStyle = `rgba(0, 0, 0, ${this.overlay})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  drawText(ctx, textConfig, y, canvas) {
    const fontSize = this.applyText(
      ctx,
      textConfig.size,
      textConfig.data,
      canvas.width
    );
    ctx.font = `${fontSize}px ${textConfig.font}`;
    ctx.fillStyle = textConfig.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;

    ctx.fillStyle = textConfig.color;
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;

    ctx.fillText(textConfig.data.toUpperCase(), canvas.width / 2, y);
  }

  drawRoundedImageWithShadow(
    ctx,
    img,
    x,
    y,
    width,
    height,
    radius,
    borderColor,
    borderWidth,
    shadowColor,
    shadowBlur
  ) {
    ctx.save();

    const avatarX = x + (width - 2 * radius) / 2;
    const avatarY = y + (height - 2 * radius) / 2;

    ctx.beginPath();
    ctx.arc(
      avatarX + radius,
      avatarY + radius,
      radius + borderWidth,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    this.drawRoundedImage(
      ctx,
      img,
      avatarX,
      avatarY,
      width + 2 * borderWidth,
      height + 2 * borderWidth,
      radius
    );
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(
      avatarX + radius,
      avatarY + radius,
      radius + borderWidth,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.fillStyle = borderColor;
    ctx.fill();
    ctx.restore();

    this.drawRoundedImage(ctx, img, avatarX, avatarY, width, height, radius);
  }

  drawRoundedImage(ctx, img, x, y, width, height, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, x, y, width, height);

    ctx.restore();
  }

  applyText(context, initialSize, text, maxWidth) {
    let fontSize = initialSize;

    while (
      this.measureTextWidth(context, `${fontSize}px RUSSOONE`, text) > maxWidth
    ) {
      fontSize -= 10;
    }

    return fontSize;
  }

  measureTextWidth(context, font, text) {
    context.font = font;
    return context.measureText(text).width;
  }
}
