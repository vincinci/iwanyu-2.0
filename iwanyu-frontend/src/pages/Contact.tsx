import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  
  Phone, 
  
  Clock, 
  MessageSquare, 
  Send,
  CheckCircle,
  HeadphonesIcon
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  type: z.enum(['general', 'vendor', 'technical', 'billing'])
});

type ContactForm = z.infer<typeof contactSchema>;

const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual contact form submission
      console.log('Contact form data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error submitting contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      description: "Get help via email",
      contact: "support@iwanyu.rw",
      action: "mailto:support@iwanyu.rw"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Support",
      description: "Call us directly",
      contact: "+250 788 123 456",
      action: "tel:+250788123456"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Live Chat",
      description: "Chat with our team",
      contact: "Available 9 AM - 6 PM",
      action: "#"
    }
  ];

  const supportTypes = [
    {
      value: "general",
      label: "General Inquiry",
      description: "Questions about our platform"
    },
    {
      value: "vendor", 
      label: "Vendor Support",
      description: "Help with selling on Iwanyu"
    },
    {
      value: "technical",
      label: "Technical Issue",
      description: "Bug reports or technical problems"
    },
    {
      value: "billing",
      label: "Billing & Payments",
      description: "Payment and billing questions"
    }
  ];

  if (isSubmitted) {
    return (
      <Layout>
        <section className="py-20 bg-gradient-to-br from-green-50 via-white to-blue-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Message Sent Successfully!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for contacting us. We'll get back to you within 24 hours.
              </p>
              <Button 
                onClick={() => setIsSubmitted(false)}
                variant="success"
                size="lg"
              >
                Send Another Message
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Get in 
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Touch</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Have questions? Need help? We're here to assist you. 
              Reach out to our team and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.action}
                className="bg-gray-50 rounded-xl p-8 text-center hover:bg-gray-100 transition-colors duration-200 group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full text-white mb-6 group-hover:scale-105 transition-transform duration-200">
                  {method.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {method.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {method.description}
                </p>
                <div className="text-green-600 font-medium">
                  {method.contact}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Send us a Message
            </h2>
            <p className="text-xl text-gray-600">
              Fill out the form below and we'll respond within 24 hours.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Support Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  What can we help you with?
                </label>
                <div className="grid sm:grid-cols-2 gap-4">
                  {supportTypes.map((type) => (
                    <label key={type.value} className="relative">
                      <input
                        type="radio"
                        value={type.value}
                        {...register('type')}
                        className="sr-only peer"
                      />
                      <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-green-500 peer-checked:bg-green-50 hover:border-gray-300 transition-colors">
                        <div className="font-medium text-gray-900 mb-1">
                          {type.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          {type.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.type && (
                  <p className="text-red-600 text-sm mt-2">{errors.type.message}</p>
                )}
              </div>

              {/* Personal Information */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="Your full name"
                    {...register('name')}
                    error={errors.name?.message}
                  />
                </div>
                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="your.email@example.com"
                    {...register('email')}
                    error={errors.email?.message}
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <Input
                  label="Subject"
                  type="text"
                  placeholder="Brief description of your inquiry"
                  {...register('subject')}
                  error={errors.subject?.message}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows={6}
                  placeholder="Please provide details about your inquiry..."
                  {...register('message')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                />
                {errors.message && (
                  <p className="text-red-600 text-sm mt-2">{errors.message.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <Button
                  type="submit"
                  variant="success"
                  size="lg"
                  disabled={isSubmitting}
                  className="px-8 py-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Office Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Visit Our Office
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-600">
                      KG 123 St, Kigali<br />
                      Rwanda
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Clock className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <HeadphonesIcon className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Support Hours</h3>
                    <p className="text-gray-600">
                      24/7 online support<br />
                      Phone support: 9:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8 lg:p-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Quick Support
              </h3>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Need immediate assistance? Check out our help center for instant answers 
                to common questions, or reach out via our fastest support channels.
              </p>
              
              <div className="space-y-4">
                <a
                  href="/help"
                  className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <span className="font-medium text-gray-900">Help Center</span>
                  <span className="text-green-600">→</span>
                </a>
                
                <button
                  type="button"
                  className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-shadow w-full text-left"
                  onClick={() => {/* Handle live chat */}}
                >
                  <span className="font-medium text-gray-900">Live Chat</span>
                  <span className="text-green-600">→</span>
                </button>
                
                <a
                  href="tel:+250788123456"
                  className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <span className="font-medium text-gray-900">Call Now</span>
                  <span className="text-green-600">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
