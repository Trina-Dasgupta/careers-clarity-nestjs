import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private stripeSecret: string | undefined;
  private stripe: any;

  constructor(private config: ConfigService) {
    this.stripeSecret = this.config.get<string>('STRIPE_SECRET_KEY');
    if (this.stripeSecret) {
      // lazy require to avoid runtime error when not installed
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Stripe = require('stripe');
      this.stripe = new Stripe(this.stripeSecret, { apiVersion: '2022-11-15' });
    }
  }

  async createPaymentIntent(amount: number, currency = 'usd', metadata = {}) {
    if (!this.stripe) {
      // Return a stubbed response for local development
      return { provider: 'stub', clientSecret: 'stubbed_client_secret', amount, currency, metadata };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to cents
        currency,
        metadata,
        payment_method_types: ['card'],
      });
      return { provider: 'stripe', clientSecret: paymentIntent.client_secret, id: paymentIntent.id, metadata };
    } catch (err) {
      throw new InternalServerErrorException('Stripe payment intent creation failed');
    }
  }
}
