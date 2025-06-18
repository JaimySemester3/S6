const { storeConsent, fetchConsent } = require('../../src/controllers/userController');

jest.mock('../../src/services/auth0Client', () => ({
  updateUserConsent: jest.fn().mockResolvedValue(true),
  getUserConsent: jest.fn().mockResolvedValue({ accepted: true }),
}));

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('userController', () => {
  it('storeConsent - success', async () => {
    const req = { auth: { sub: 'user123' } };
    const res = mockResponse();

    await storeConsent(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('fetchConsent - success', async () => {
    const req = { auth: { sub: 'user123' } };
    const res = mockResponse();

    await fetchConsent(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, consent: { accepted: true } });
  });
});
