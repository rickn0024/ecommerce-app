import React from 'react';
import { Card, CardContent } from './ui/card';
import { DollarSign, Headset, ShoppingBag, WalletCards } from 'lucide-react';

export default function IconBoxes() {
  return (
    <div>
      <Card>
        <CardContent className="grid md:grid-cols-4 gap-4 p-4">
          <div className="space-y-2">
            <ShoppingBag />
            <div className="text-sm font-bold">Free Shipping</div>
            <div className="text-sm text-muted-foreground">
              Free shipping on orders over $100
            </div>
          </div>
          <div className="space-y-2">
            <DollarSign />
            <div className="text-sm font-bold">Money Back Guarantee</div>
            <div className="text-sm text-muted-foreground">
              Within 30 days of checkout
            </div>
          </div>
          <div className="space-y-2">
            <WalletCards />
            <div className="text-sm font-bold">Flexable Payment</div>
            <div className="text-sm text-muted-foreground">
              Pay with Credit Card or PayPal
            </div>
          </div>
          <div className="space-y-2">
            <Headset />
            <div className="text-sm font-bold">24/7 Support</div>
            <div className="text-sm text-muted-foreground">
              Geet support at any time
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
