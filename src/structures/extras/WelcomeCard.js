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
    this.title = {
      data: 'Welcome',
      color: '#fff',
    };
    this.username = {
      data: 'Unknown',
      color: '#fff',
    };
    this.description = {
      data: '',
      color: '#fff',
    };
    this.overlay = 0;
  }

  setBackground(type, value) {
    this.background.type = type
      ? type === 'image'
        ? /(http(s?):)|([/|.|\w|\s])*\.(?:jpg|jpeg|png)/.test(value)
          ? 'image'
          : 'color'
        : 'color'
      : 'color';
    if (type === null || type === 'color')
      /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(value)
        ? (this.background.src = value)
        : null;
    else if (type === 'image')
      /(http(s?):)|([/|.|\w|\s])*\.(?:jpg|jpeg|png)/.test(value)
        ? (this.background.src = value)
        : null;
    return this;
  }

  setAvatar(value, border) {
    /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(border)
      ? (this.avatar.border = border)
      : null;
    value ? (this.avatar.src = value) : null;

    return this;
  }

  setTitle(value, color) {
    /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)
      ? (this.title.color = color)
      : null;
    value ? (this.title.data = value) : null;

    return this;
  }

  setUsername(value, color) {
    /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)
      ? (this.username.color = color)
      : null;
    value ? (this.username.data = value) : null;

    return this;
  }
  setDescription(value, color) {
    /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)
      ? (this.description.color = color)
      : null;
    value ? (this.description.data = value) : null;

    return this;
  }

  setOverlay(value) {
    /^[0-9]*[.][0-9]+$/.test(value)
      ? (this.overlay = value)
      : (this.overlay = 0);

    return this;
  }

  async createImage() {
    const canvas = createCanvas(1024, 500);
    const ctx = canvas.getContext('2d', { alpha: false });

    if (this.background.type === 'color') {
      ctx.beginPath();
      ctx.fillStyle = this.background.src;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (this.background.type === 'image') {
      try {
        const background = await loadImage(this.background.src);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      } catch (err) {
        console.log(err);
        ctx.beginPath();
        ctx.fillStyle = '#191919';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    ctx.fillStyle = `rgba(0, 0, 0, ${this.overlay})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const avatarSize = 250;
    const avatarImage = await loadImage(this.avatar.src);
    const avatarX = (canvas.width - avatarSize) / 2;
    this.drawRoundedImageWithShadow(
      ctx,
      avatarImage,
      avatarX,
      45,
      avatarSize,
      avatarSize,
      avatarSize / 2,
      this.avatar.border,
      8,
      'black',
      10
    );

    ctx.font = '60px RUSSOONE';
    ctx.fillStyle = this.title.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.fillText(this.title.data.toUpperCase(), canvas.width / 2, 350);

    ctx.font = this.applyText(canvas, ctx, 45, this.username.data);
    ctx.fillStyle = this.username.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.fillText(this.username.data.toUpperCase(), canvas.width / 2, 400);

    if (
      (typeof this?.description?.data === 'string' &&
        this?.description?.data?.trim()?.length !== 0) ||
      this?.description?.data !== null ||
      this?.description?.data !== undefined
    ) {
      ctx.font = this.applyText(canvas, ctx, 35, this?.description?.data);
      ctx.fillStyle = this.description.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.fillText(this.description.data.toUpperCase(), canvas.width / 2, 440);
    }

    const outputBuffer = await canvas.toBuffer('image/png');
    return new AttachmentBuilder(outputBuffer, {
      name: 'welcome.png',
    });
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
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius + borderWidth, 0, Math.PI * 2);
    ctx.closePath();
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    this.drawRoundedImage(
      ctx,
      img,
      x - borderWidth,
      y - borderWidth,
      width + 2 * borderWidth,
      height + 2 * borderWidth,
      radius
    );
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius + borderWidth, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = borderColor;
    ctx.fill();
    ctx.restore();

    this.drawRoundedImage(ctx, img, x, y, width, height, radius);
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

  applyText = (canvas, context, initialSize, text) => {
    let fontSize = initialSize;

    do {
      context.font = `${(fontSize -= 10)}px RUSSOONE`;
    } while (context.measureText(text).width > canvas.width);

    return context.font;
  };
}
