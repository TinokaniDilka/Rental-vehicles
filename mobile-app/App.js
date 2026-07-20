import React from 'react';

import { AuthProvider } from './context/AuthContext';

import AppNavigator from './navigation/AppNavigator';

import { StripeProvider } from '@stripe/stripe-react-native';



export default function App() {

  return (

    <AuthProvider>

      <StripeProvider

        publishableKey="pk_test_your_stripe_publishable_key_here"

        merchantIdentifier="merchant.com.yourcompany.yourapp"

      >

        <AppNavigator />

      </StripeProvider>

    </AuthProvider>

  );

}