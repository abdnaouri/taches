export default {
  async email(message, env, ctx) {
    const recipients = [
      "badaoui.ell.mehdi@gmail.com",
      "abdnaouri@gmail.com"
    ];

    for (const recipient of recipients) {
      await message.forward(recipient);
    }
  },
};
