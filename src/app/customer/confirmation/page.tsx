// src/app/confirmation/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export default function ConfirmationPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  
  useEffect(() => {
    // Generate a random order number
    const randomOrderNum = Math.floor(10000 + Math.random() * 90000);
    setOrderNumber(randomOrderNum.toString());
    
    // Set estimated time (15-25 minutes from now)
    const minWait = 15;
    const maxWait = 25;
    const waitTime = Math.floor(minWait + Math.random() * (maxWait - minWait));
    setEstimatedTime(`${waitTime} minutes`);
  }, []);
  
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
      <p className="text-lg text-gray-600 mb-8">Your order has been received and is being prepared.</p>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm text-gray-500 mb-1">Order Number</h3>
              <p className="text-2xl font-bold text-gray-900">#{orderNumber}</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm text-gray-500 mb-1">Estimated Time</h3>
              <p className="text-2xl font-bold text-gray-900">{estimatedTime}</p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Please keep an eye on the screen behind the counter for your order number.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Alert variant="info" className="mb-8">
        <p className="text-center">
          Your receipt has been sent to the email associated with your account.
        </p>
      </Alert>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => window.location.href = '/menu'}
        >
          Back to Menu
        </Button>
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => window.location.href = '/track-order'}
        >
          Track My Order
        </Button>
      </div>
    </div>
  );
}