import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons, ReactPayPalScriptOptions } from '@paypal/react-paypal-js';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import AppBar from '../components/AppBar';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  emailgencount: number;
  trialCount: number;
}

interface UserPlan {
  plan: string;
  emailgencount: number;
  trialCount: number;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 9.99,
    features: [
      '50 Email Generations',
      '2 Cover Letter Generations',
      'Resume Upload',
      'Email & Cover Letter Templates',
      'Basic Support'
    ],
    emailgencount: 50,
    trialCount: 2
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 19.99,
    features: [
      '150 Email Generations',
      '4 Cover Letter Generations',
      'Resume Upload',
      'Priority Support',
      'Advanced Templates',
      'Analytics Dashboard'
    ],
    emailgencount: 150,
    trialCount: 4
  }
];

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'user', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentPlan({
              plan: userData.plan,
              emailgencount: userData.emailgencount,
              trialCount: userData.trialCount
            });
          }
        } catch (error) {
          console.error('Error fetching user plan:', error);
        }
      }
    };

    fetchUserPlan();
  }, [user]);

  const handlePaymentSuccess = async (plan: Plan, orderID: string, paymentMethod: 'paypal' | 'venmo') => {
    if (!user) {
      toast.error('Please sign in to purchase a plan');
      navigate('/signin');
      return;
    }

    setIsProcessing(true);
    try {
      const userRef = doc(db, 'user', user.uid);
      await updateDoc(userRef, {
        emailgencount: plan.emailgencount,
        trialCount: plan.trialCount,
        plan: plan.id,
        lastPayment: serverTimestamp(),
        paymentOrderId: orderID,
        paymentMethod: paymentMethod,
        updatedAt: serverTimestamp()
      });

      // Update local state
      setCurrentPlan({
        plan: plan.id,
        emailgencount: plan.emailgencount,
        trialCount: plan.trialCount
      });

      toast.success('Payment successful! Your plan has been upgraded.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Firebase update error:', error);
      toast.error('Failed to update subscription. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const paypalOptions: ReactPayPalScriptOptions = {
    clientId: "AWcbmz0VSEowOjxsFHdoBoUseA6HhYonXSgDEXgo_NZdLqIhu5Z__PVzU7DJKMxNn8s8rAoWfGCjymMr",
    currency: "USD",
    intent: "capture",
    components: "buttons,funding-eligibility",
    enableFunding: ["venmo"],
    disableFunding: ["credit"]
  };

  const isPlanActive = (planId: string) => {
    return currentPlan?.plan === planId;
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <div className="min-h-screen bg-gray-50">
        <AppBar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600">
              Select the perfect plan for your job application needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-black rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300 flex flex-col justify-between"
              >
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {plan.name}
                      </h2>
                      <div className="mt-2 flex items-baseline">
                        <span className="text-5xl font-extrabold text-white">
                          ${plan.price}
                        </span>
                        <span className="text-gray-400 ml-1">/month</span>
                      </div>
                      {isPlanActive(plan.id) && (
                        <span className="mt-2 inline-block px-3 py-1 bg-green-500 text-white rounded-full text-sm">
                          Current Plan
                        </span>
                      )}
                    </div>
                    <img 
                      src="/images/Quicksend_logo_new.png"
                      alt="Quicksend Logo"
                      className="w-44 h-34 object-contain"
                    />
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-white">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {!isProcessing && (
                  <div className="mt-auto">
                    {/* PayPal Button */}
                    <PayPalButtons
                      forceReRender={[plan.id, plan.price]}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [{
                            description: plan.name,
                            amount: {
                              currency_code: "USD",
                              value: plan.price.toString(),
                              breakdown: {
                                item_total: {
                                  currency_code: "USD",
                                  value: plan.price.toString()
                                }
                              }
                            },
                            items: [{
                              name: plan.name,
                              quantity: "1",
                              unit_amount: {
                                currency_code: "USD",
                                value: plan.price.toString()
                              },
                              category: "DIGITAL_GOODS"
                            }]
                          }]
                        });
                      }}
                      onApprove={async (data, actions) => {
                        try {
                          if (!actions.order) {
                            throw new Error('Order actions not available');
                          }
                          const details = await actions.order.capture();
                          const orderId = data.orderID || details.id;
                          if (!orderId) {
                            throw new Error('Order ID not found');
                          }
                          await handlePaymentSuccess(
                            plan, 
                            orderId, 
                            details.payment_source?.venmo ? 'venmo' : 'paypal'
                          );
                        } catch (error) {
                          console.error('PayPal capture error:', error);
                          toast.error('Payment failed. Please try again or contact support.');
                          setIsProcessing(false);
                        }
                      }}
                      onError={(err) => {
                        console.error('PayPal error:', err);
                        toast.error('Payment failed. Please try again or contact support.');
                        setIsProcessing(false);
                      }}
                      style={{ layout: "horizontal" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-gray-600">
            <p className="text-sm">
              All plans include access to our AI-powered email and cover letter generation tools.
              <br />
              Need a custom plan? <a href="mailto:contactquicklyandsend@gmail.com" className="text-blue-600 hover:text-blue-500">Contact us</a>
            </p>
          </div>
        </main>
      </div>
    </PayPalScriptProvider>
  );
};

export default Pricing;