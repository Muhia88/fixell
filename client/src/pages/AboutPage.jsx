import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  const team = [
  {
    name: "Justin Tutu",
    role: "Creative Systems Architect",
    image: "/people/tutu.jpg",
    bio: "Bridges imagination and engineering — shaping both the look and logic of Fixell. Blends AI, code, and design to make sustainability feel smart and human.",
  },
  {
    name: "Purity Okaroni",
    role: "Frontend & Experience Engineer",
    image: "/people/purity2.jpg",
    bio: "Turns design into reality. Crafts beautiful, responsive interfaces that tell Fixell’s story — where style meets purpose in every user journey.",
  },
  {
    name: "Daniel Muhia",
    role: "API & Systems Engineer",
    image: "/people/dan.jpg",
    bio: "Builds the backbone of Fixell — the APIs and data systems that make AI-assisted repairs, trade, and community connections possible.",
  },
];

  return (
    <>
      <div className="min-h-screen w-full flex flex-col bg-gray-50">
        <div className="flex flex-col items-center justify-center py-10 bg-gradient-to-r from-green-600 to-lime-500 text-white">
          <h1 className="text-3xl font-bold mb-3">About Fixell</h1>
          <p className="text-sm opacity-90">
            Turning trash into treasure — empowering repair, reuse, and sustainable commerce.
          </p>
        </div>

        <div className="relative w-full px-4 md:px-8 py-6 flex-1 flex flex-col">

<section className="bg-grey-50 py-16">
  <div className="max-w-4xl mx-auto text-center">
    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
      Our Story — Fix Smarter, Live Greener
    </h2>
    <p className="text-gray-600 leading-relaxed mb-4">
      Fixell was born from a simple idea — <span className="italic">“what if technology could help us waste less?”</span>
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      Every year, millions of usable items are thrown away — from furniture and electronics to clothing — 
      not because they’re beyond repair, but because people don’t know <strong>how to fix them</strong>.
      That’s where Fixell steps in.
    </p>
    <p className="text-gray-600 leading-relaxed mb-4">
      Using the power of <strong>AI assistance</strong>, Fixell helps users identify repair solutions, find tutorials,
      and discover creative ways to give broken things a second life. 
      But if an item can’t be fixed, users can still <strong>sell</strong> through our marketplace to 
      artisans, recyclers, or people who can reuse its parts.
    </p>
    <p className="text-gray-600 leading-relaxed">
      Fixell combines artificial intelligence, community collaboration, and sustainability to 
      reduce pollution, inspire innovation, and prove that even broken things have value.
    </p>
  </div>
</section>


<section className="bg-gray-50 py-16">
  <div className="w-full px-4 md:px-3">
    <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">Who We Are</h2>
    <div className="prose prose-lg mx-auto max-w-4xl text-gray-700">
      <p className="text-gray-600 leading-relaxed mb-4">
        Fixell is an AI-powered sustainability platform that empowers people to repair, reuse, 
        and resell their items instead of throwing them away. 
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        Our intelligent assistant guides users step-by-step through possible fixes — 
        whether it’s troubleshooting a broken lamp, re-stitching torn clothes, or restoring old furniture. 
        If repair isn’t an option, Fixell’s marketplace connects users to buyers or recyclers who can give it new purpose.
      </p>
      <p className="text-gray-600 leading-relaxed">
        We’re more than a platform — we’re a movement to rethink waste, 
        powered by technology, creativity, and community.
      </p>
    </div>
  </div>
</section>



          <section className="bg-gray-50 py-16">
            <div className="w-full px-4 md:px-3">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                Our Mission & Vision
              </h2>
              <div className="prose prose-lg mx-auto max-w-4xl text-gray-700">
                <h3 className="text-lg font-semibold text-green-700 mb-2">Our Mission</h3>
                <p>
                  To create a sustainable digital marketplace that empowers people to repair, reuse,
                  and recycle — reducing waste while promoting creativity and community-driven
                  innovation.
                </p>

                <h3 className="text-lg font-semibold text-green-700 mt-6 mb-2">Our Vision</h3>
                <p>
                  To become the leading eco-tech platform in Africa, inspiring millions to
                  contribute to a greener future by making sustainability easy and accessible for
                  everyone.
                </p>
              </div>
            </div>
          </section>


          <section className="bg-gray-50 py-20 px-6">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-10">Meet Our Team</h2>
              <p className="text-gray-600 mb-14 max-w-2xl mx-auto">
                The passionate individuals driving Fixell’s mission to transform sustainability into a
                lifestyle — combining tech, creativity, and purpose.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
                {team.map((member) => (
                  <div
                    key={member.name}
                    className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition transform hover:-translate-y-2 w-full max-w-sm mx-auto"
                  >
                    <div className="relative mb-4">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-28 h-28 mx-auto rounded-full object-cover border-4 border-green-100 group-hover:border-green-500 transition"
                      />
                      <div className="absolute inset-0 rounded-full bg-green-500/0 group-hover:bg-green-500/10 transition"></div>
                    </div>
                    <h4 className="font-semibold text-gray-800 text-lg">{member.name}</h4>
                    <p className="text-sm text-green-700 font-medium mb-2">{member.role}</p>
                    <p className="text-gray-500 text-xs">{member.bio}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>


          <section className="bg-green-600 py-14 text-center text-white mt-8">
            <h2 className="text-2xl font-bold mb-3">Join the Fixell Movement</h2>
            <p className="text-sm mb-6 opacity-90">
              Start buying, selling, or fixing sustainable products today.
            </p>
            <Link
              to="/marketplace"
              className="bg-white text-green-700 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition"
            >
              Explore Marketplace
            </Link>
          </section>
        </div>
      </div>
    </>
  );
};

export default About;
