export default {
  name: 'fetchBannerURL',
  async execute(
    userId,
    { format = 'webp', size = 1024, dynamic = true } = [],
    client
  ) {
    const allowedFormats = ['webp', 'png', 'jpg', 'jpeg', 'gif'];
    const allowedSizes = Array.from({ length: 9 }, (e, i) => 2 ** (i + 4));

    if (!allowedFormats.includes(format)) {
      format = 'webp';
    }

    if (!allowedSizes.includes(parseInt(size)) || isNaN(parseInt(size))) {
      size = 1024;
    }

    let Banner = '';

    try {
      const response = await fetch(
        `https://discord.com/api/v10/users/${userId}`,
        {
          method: 'GET',
          headers: { Authorization: `Bot ${client.token}` },
        }
      );

      const user = await response.json();

      if (
        user.code == 50035 ||
        (user.banner === null && user.banner_color !== null) ||
        (user.banner === null && user.banner_color === null)
      ) {
        Banner = '';
      }

      if (user.banner !== null) {
        Banner = `https://cdn.discordapp.com/banners/${userId}/${user.banner}.${
          dynamic === true && user.banner.startsWith('a_') ? 'gif' : format
        }${parseInt(size) ? `?size=${parseInt(size)}` : ''}`;
      }
    } catch (err) {
      throw new Error(err);
    }

    return Banner;
  },
};
