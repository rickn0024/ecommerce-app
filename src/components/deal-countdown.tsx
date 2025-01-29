'use client';

import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import Image from 'next/image';

// Set static target date (replace with desired date)
const TARGET_DATE = new Date('2025-02-05T00:00:00');

// Function to calculate time remaining
const calculateTimeRemaining = (targetDate: Date) => {
  const currentDate = new Date();
  const timeDifference = Math.max(Number(targetDate) - Number(currentDate), 0);

  return {
    days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    ),
    minutes: Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((timeDifference % (1000 * 60)) / 1000),
  };
};

export default function DealCountdown() {
  const [time, setTime] = useState<ReturnType<typeof calculateTimeRemaining>>();

  useEffect(() => {
    // Calculate initial time remaining
    setTime(calculateTimeRemaining(TARGET_DATE));

    const timeInterval = setInterval(() => {
      // Update time remaining every second
      const newTime = calculateTimeRemaining(TARGET_DATE);
      setTime(newTime);

      if (
        newTime.days === 0 &&
        newTime.hours === 0 &&
        newTime.minutes === 0 &&
        newTime.seconds === 0
      ) {
        // Clear interval when time reaches 0
        clearInterval(timeInterval);
      }

      return () => clearInterval(timeInterval);
    }, 1000);
  }, []);

  if (!time) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 my-20">
        <div className="flex flex-col gap-2 justify-center">
          <h3 className="text-3xl font-bold">Loading Countdown</h3>
        </div>
      </section>
    );
  }

  if (
    time.days === 0 &&
    time.hours === 0 &&
    time.minutes === 0 &&
    time.seconds === 0
  ) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 my-20">
        <div className="flex flex-col gap-2 justify-center">
          <h3 className="text-3xl font-bold">This Deal Has Ended</h3>
          <p>This deal is no longer available. Check out our other products!</p>

          <div className="text-start">
            <Button asChild>
              <Link href="/search">View Products</Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          <Image src="/images/promo.jpg" alt="Deals" width={300} height={200} />
        </div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 my-20">
      <div className="flex flex-col gap-2 justify-center">
        <h3 className="text-3xl font-bold">Deals Of The Month</h3>
        <p>
          Get exclusive discounts on our selected products for this month only.
          Hurry up and grab your favorite products before the deals end. Check
          out our products now! 🛒🎁
        </p>
        <ul className="grid grid-cols-4">
          <StatBox label="Days" value={time.days} />
          <StatBox label="Hours" value={time.hours} />
          <StatBox label="Minutes" value={time.minutes} />
          <StatBox label="Seconds" value={time.seconds} />
        </ul>
        <div className="text-center">
          <Button asChild>
            <Link href="/search">View Products</Link>
          </Button>
        </div>
      </div>
      <div className="flex justify-center">
        <Image src="/images/promo.jpg" alt="Deals" width={300} height={200} />
      </div>
    </section>
  );
}

const StatBox = ({ label, value }: { label: string; value: number }) => (
  <li className="p-4 w-full text-center">
    <p className="text-3xl font-bold">{value}</p>
    <p>{label}</p>
  </li>
);
