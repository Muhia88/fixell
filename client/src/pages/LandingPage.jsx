import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import heroImage from '../assets/images/hero section.jpg'; 


const WrenchIcon = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15v2m-6-4h.01M19 13h.01M15 13h.01M12 22v-4m5-4h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m6 0h2"></path></svg>
);

const HomeIcon = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-10l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6m-6 0h-2a1 1 0 01-1-1v-4m5-6h-3M9 16h6"></path></svg>
);

const RecycleIcon = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356-2A8.001 8.001 0 004.582 19.94H4v1.077c.38.16.8.272 1.25.323l.1.006A9.957 9.957 0 0020 12c0-5.523-4.477-10-10-10a9.972 9.972 0 00-6.702 2.651l.858.914A8.001 8.001 0 0120 12c0 4.418-3.582 8-8 8s-8-3.582-8-8z"></path></svg>
);

const FeatureCard = ({ icon, title, description }) => {
    const Icon = icon;
    return (
        <div className="flex-1 p-8 bg-white text-center transition duration-300 hover:shadow-xl hover:border-fixell-green border border-transparent rounded-lg">
            <div className="mb-4 inline-block p-4 rounded-full bg-fixell-light text-fixell-green">
                <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 text-base">{description}</p>
        </div>
    );
};

const App = () => {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/impact');
        }
    }, [isLoggedIn, navigate]);

    const features = [
        {
            icon: WrenchIcon,
            title: "Repair",
            description: "Find expert guides and resources to repair and extend the lifespan and utility of your belongings, saving money.",
        },
        {
            icon: HomeIcon,
            title: "Rehome",
            description: "Connect with others to safely rehome items you no longer need, giving them a new life and reducing landfill waste.",
        },
        {
            icon: RecycleIcon,
            title: "Renew",
            description: "Discover innovative ways to renew and repurpose your items, transforming them into something new and valuable.",
        },
    ];

    return (
        <div className="w-full min-h-screen antialiased" style={{ fontFamily: 'Inter, sans-serif' }}>
            <style>{`
                .hero-background {
                    background-image: url('${heroImage}');
                    background-size: cover;
                    background-position: center;
                    position: relative;
                }
                .hero-overlay {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(180deg, rgba(30, 64, 42, 0.9) 0%, rgba(0, 0, 0, 0.4) 60%, rgba(0, 0, 0, 0.0) 100%);
                }
                /* Custom utility color definition */
                .bg-fixell-green { background-color: #059669; } /* Emerald-600 */
                .text-fixell-green { color: #059669; }
                .bg-fixell-light { background-color: #ECFDF5; } /* Emerald-50 */
                .bg-fixell-cta { background-color: #E6FAEE; } /* Lighter green for CTA section */
            `}</style>

            {/* 1. HERO SECTION */}
            <section className="hero-background min-h-screen flex items-center justify-center text-center">
                <div className="hero-overlay"></div>

                <div className="relative z-10 px-4 py-32 text-white max-w-4xl mx-auto"> 
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 drop-shadow-lg">
                        Repair. Rehome. Renew.
                    </h1>
                    <p className="text-lg md:text-xl font-medium mb-10 opacity-90 leading-relaxed">
                        Fixell is your go-to platform for sustainable living. We help you repair, rehome, or renew your household items, reducing consumption and promoting a circular economy.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        
                        <a href="/register" className="inline-block px-8 py-3 bg-fixell-green text-white text-lg font-semibold rounded-full shadow-lg hover:bg-emerald-700 transition duration-300">
                            Get Started
                        </a>
                        <a href="#how-it-works" className="inline-block px-8 py-3 bg-transparent border-2 border-white text-white text-lg font-semibold rounded-full hover:bg-white hover:text-fixell-green transition duration-300">
                            Learn More
                        </a>
                    </div>
                </div>
            </section>

            {/* 2. HOW IT WORKS SECTION */}
            <section id="how-it-works" className="py-24 px-4 bg-white w-full">
                <div className="text-center max-w-7xl mx-auto"> 
                    <h2 className="text-4xl font-bold mb-4">How It Works</h2>
                    <p className="text-lg text-gray-600 max-w-xl mx-auto mb-16">
                        Fixell simplifies sustainable living with a user-friendly platform that guides you through repairing, rehoming, or renewing your household items.
                    </p>

                    {/* CHANGE 2: Flexbox layout for horizontal features */}
                    <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8 justify-center">
                        {features.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. CALL TO ACTION (CTA) SECTION (Button changed to Login and redirects) */}
            <section className="bg-fixell-cta py-20 px-4 w-full">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
                    <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
                        Start your journey towards a more sustainable life with Fixell. Sign up now and begin reducing waste, one item at a time.
                    </p>
    
                    <a href="/login" className="inline-block px-10 py-4 bg-fixell-green text-white text-xl font-bold rounded-full shadow-lg hover:bg-emerald-700 transition duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
                        Login
                    </a>
                </div>
            </section>
        </div>
    );
};

export default App;