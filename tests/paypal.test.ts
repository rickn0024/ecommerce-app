import { generateAccessToken, paypal } from '../src/lib/paypal';

// Test genreate access token from paypal

test('generate access token from paypal', async () => {
  const tokenResponse = await generateAccessToken();
  console.log(tokenResponse);
  expect(typeof tokenResponse).toBe('string');
  expect(tokenResponse.length).toBeGreaterThan(0);
});

// Test create order from paypal
test('generate order from paypal', async () => {
  const tokenResponse = await generateAccessToken();
  const price = 10.0;
  console.log(tokenResponse);

  const orderResponse = await paypal.createOrder(price);
  console.log(orderResponse);

  expect(orderResponse).toHaveProperty('id');
  expect(orderResponse).toHaveProperty('status');
  expect(orderResponse.status).toBe('CREATED');
});

// Test to capture payment with mock order
test('simulate capture payment from paypal order', async () => {
  const orderId = '100';

  const mockCapturePayment = jest
    .spyOn(paypal, 'capturePayment')
    .mockResolvedValue({
      status: 'COMPLETED',
    });

  const captureResponse = await paypal.capturePayment(orderId);

  expect(captureResponse).toHaveProperty('status', 'COMPLETED');

  mockCapturePayment.mockRestore();
});
