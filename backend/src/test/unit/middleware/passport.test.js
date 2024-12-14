describe("Environment Variables", () => {
  it("should have FACEBOOK_CLIENT_ID", () => {
    expect(process.env.FACEBOOK_CLIENT_ID).toBeDefined();
  });

  it("should have FACEBOOK_CLIENT_SECRET", () => {
    expect(process.env.FACEBOOK_CLIENT_SECRET).toBeDefined();
  });
});
