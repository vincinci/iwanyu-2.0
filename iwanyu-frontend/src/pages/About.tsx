import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send,
  ArrowRight,
  Users,
  Heart,
  Award
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';

const About: React.FC = () => {
  const values = [
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Community First",
      description: "We believe in empowering local entrepreneurs and connecting communities through commerce."
    },
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Customer Care",
      description: "Every customer interaction matters. We're committed to providing exceptional service and support."
    },
    {
      icon: <Award className="w-8 h-8 text-blue-600" />,
      title: "Quality Excellence",
      description: "We maintain high standards for products and services to ensure the best experience for everyone."
    }
  ];

  const team = [
    {
      name: "Jean Baptiste",
      role: "CEO & Founder",
      description: "Passionate about connecting Rwandan entrepreneurs with customers nationwide.",
      image: "JB"
    },
    {
      name: "Marie Claire",
      role: "Head of Vendor Relations", 
      description: "Dedicated to helping vendors succeed and grow their businesses on our platform.",
      image: "MC"
    },
    {
      name: "Patrick Uwimana",
      role: "Chief Technology Officer",
      description: "Building the technology that powers Rwanda's digital marketplace revolution.",
      image: "PU"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              About 
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Iwanyu</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Rwanda's premier online marketplace, connecting local vendors with customers across the country. 
              We're building the future of e-commerce in Rwanda, one vendor at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Iwanyu was founded with a simple but powerful vision: to make e-commerce accessible 
                and profitable for every Rwandan entrepreneur, regardless of their size or technical expertise.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We believe that by empowering local businesses with the tools and platform they need to reach 
                customers online, we can drive economic growth and create opportunities across Rwanda.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Empowering Entrepreneurs</h4>
                    <p className="text-gray-600">Providing tools and support for business growth</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Connecting Communities</h4>
                    <p className="text-gray-600">Bridging the gap between sellers and buyers</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Driving Innovation</h4>
                    <p className="text-gray-600">Leading digital transformation in commerce</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-12 text-center">
              <div className="mb-8">
                <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">500+</div>
                <div className="text-gray-600">Active Vendors</div>
              </div>
              <div className="mb-8">
                <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">10K+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div>
                <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">50K+</div>
                <div className="text-gray-600">Products Sold</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do and shape how we serve our community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 text-center">
                <div className="mb-6 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate professionals dedicated to building Rwanda's digital marketplace.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                    {member.image}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <div className="text-green-600 font-medium mb-4">
                  {member.role}
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-green-100 mb-8 leading-relaxed">
            Whether you're looking to buy or sell, Iwanyu is here to connect you with 
            the best products and opportunities in Rwanda.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/become-vendor">
              <Button variant="secondary" size="lg" className="px-8 py-3">
                Become a Vendor
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <Link to="/products">
              <Button variant="outline" size="lg" className="px-8 py-3 border-white text-white hover:bg-white hover:text-green-600">
                Start Shopping
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
