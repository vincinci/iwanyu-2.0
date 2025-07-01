import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Store,
  Smartphone, 
  Users, 
  TrendingUp, 
  Shield, 
  ArrowRight, 
  CheckCircle,
  Zap,
  CreditCard,
  BarChart,
  MessageSquare,
  Truck,
  Star,
  Target,
  Briefcase
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';

const VendorGuide: React.FC = () => {
  const steps = [
    {
      step: 1,
      title: "Create Your Account",
      description: "Sign up and complete your vendor verification process",
      icon: <Users className="w-6 h-6" />,
      details: [
        "Submit basic business information",
        "Upload required documents",
        "Verify your identity",
        "Get approved within 24-48 hours"
      ]
    },
    {
      step: 2,
      title: "Set Up Your Store",
      description: "Customize your storefront and add your first products",
      icon: <Store className="w-6 h-6" />,
      details: [
        "Choose your store name and branding",
        "Add product listings with photos",
        "Set your pricing and shipping options",
        "Configure payment methods"
      ]
    },
    {
      step: 3,
      title: "Start Selling",
      description: "Launch your store and begin reaching customers",
      icon: <TrendingUp className="w-6 h-6" />,
      details: [
        "Publish your store to go live",
        "Manage orders and inventory",
        "Communicate with customers",
        "Track your sales and analytics"
      ]
    }
  ];

  const benefits = [
    {
      icon: <Smartphone className="w-8 h-8 text-green-600" />,
      title: "Mobile-First Platform",
      description: "Manage your entire business from your smartphone with our optimized mobile interface."
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Secure Payments",
      description: "Accept payments safely with our integrated payment system and fraud protection."
    },
    {
      icon: <BarChart className="w-8 h-8 text-purple-600" />,
      title: "Analytics & Insights",
      description: "Track your performance with detailed analytics and sales reports."
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-orange-600" />,
      title: "Customer Support",
      description: "Get help when you need it with our dedicated vendor support team."
    },
    {
      icon: <Truck className="w-8 h-8 text-indigo-600" />,
      title: "Logistics Support",
      description: "We help coordinate shipping and delivery to your customers."
    },
    {
      icon: <Target className="w-8 h-8 text-pink-600" />,
      title: "Marketing Tools",
      description: "Promote your products with built-in marketing and promotional features."
    }
  ];

  const faqs = [
    {
      question: "How much does it cost to become a vendor?",
      answer: "It's completely free to sign up and start selling on Iwanyu. We only take a small commission on successful sales."
    },
    {
      question: "How long does the approval process take?",
      answer: "Most vendor applications are reviewed and approved within 24-48 hours after submitting all required documents."
    },
    {
      question: "What products can I sell?",
      answer: "You can sell most legal products including electronics, clothing, home goods, and more. Some restricted items may require additional verification."
    },
    {
      question: "How do I receive payments?",
      answer: "Payments are processed securely and transferred to your bank account weekly. We support mobile money and bank transfers."
    },
    {
      question: "Do you provide shipping services?",
      answer: "We can help coordinate shipping and delivery services, or you can handle shipping yourself based on your preference."
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
              <Briefcase className="w-4 h-4 mr-2" />
              Vendor Guide
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Your Guide to
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Success</span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              Everything you need to know about becoming a successful vendor on Iwanyu. 
              From setup to sales, we'll guide you every step of the way.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to="/become-vendor">
                <Button variant="success" size="lg" className="px-6 py-2 sm:px-8 sm:py-3 text-sm sm:text-base">
                  <Store className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Start Selling Now
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in just three simple steps and begin selling to thousands of customers across Rwanda.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-green-300 to-blue-300 transform translate-x-1/2 z-0"></div>
                )}
                
                <div className="relative bg-white border-2 border-gray-100 rounded-2xl p-4 sm:p-6 lg:p-8 hover:border-green-200 hover:shadow-lg transition-all duration-300 z-10">
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full text-white mb-3 sm:mb-4">
                      {step.icon}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-green-600 mb-2">STEP {step.step}</div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600">{step.description}</p>
                  </div>
                  
                  <ul className="space-y-2 sm:space-y-3">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start space-x-2 sm:space-x-3">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-xs sm:text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Iwanyu?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              We provide everything you need to build and grow a successful online business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="mb-3 sm:mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                  {benefit.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Join Our Success Story
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-green-100">
              Thousands of vendors are already growing their business with us
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center text-white">
            <div>
              <div className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-1 sm:mb-2">500+</div>
              <div className="text-xs sm:text-sm lg:text-base text-green-100">Active Vendors</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-1 sm:mb-2">10K+</div>
              <div className="text-xs sm:text-sm lg:text-base text-green-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-1 sm:mb-2">50K+</div>
              <div className="text-xs sm:text-sm lg:text-base text-green-100">Products Sold</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-1 sm:mb-2">95%</div>
              <div className="text-xs sm:text-sm lg:text-base text-green-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                  {faq.question}
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12">
            <div className="mb-6 sm:mb-8">
              <img 
                src="/iwanyu-logo.png" 
                alt="Iwanyu Store Logo"
              />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Ready to Start Selling?
              </h2>
              <p className="text-sm sm:text-base lg:text-xl text-gray-600 leading-relaxed">
                Join thousands of successful vendors and start growing your business today. 
                It's free to get started and we'll support you every step of the way.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to="/become-vendor">
                <Button variant="success" size="lg" className="px-6 py-2 sm:px-8 sm:py-3">
                  <Store className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Become a Vendor
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
              
              <Link to="/contact">
                <Button variant="outline" size="lg" className="px-6 py-2 sm:px-8 sm:py-3">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default VendorGuide;
