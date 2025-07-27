
'use client';

import { link } from "fs";
import Link from "next/link";
import { FaLinkedin, FaEnvelope } from 'react-icons/fa';

export default function TeamDirectory() {
  const teamMembers = [
    {
      id: 1,
      name: "Prakash Mewada",
      role: "Team Leader",
      image: "https://ca.slack-edge.com/T2Z7FDAP7-U028VFK5DK2-c3b2f4b5ec8a-512",
      quote: "Let's make something great together!",
      linkedinURL: "https://www.linkedin.com/in/prakashm28/",
      email: "mailto:prakashmewada28@gmail.com"
    },
    {
      id: 2,
      name: "Mitrajsinh Gohil",
      role: "Team Member",
      image: "https://ca.slack-edge.com/T2Z7FDAP7-U04KTSRRL7J-bfda9aaba42d-512",
      quote: "Code is poetry in motion",
      linkedinURL: "https://www.linkedin.com/in/mitrajsinh-gohil-788125215/",
      email: "mailto:mitrajsinhgohil1983@gmail.com"
    },
    {
      id: 3,
      name: "Jenish Gangani",
      role: "Team Member",
      image: "https://ca.slack-edge.com/T2Z7FDAP7-U04K469B2NN-0badcdf136b1-512",
      quote: "Design speaks when words fail",
      linkedinURL: "https://www.linkedin.com/in/jenish-gangani-577440215/",
      email: "mailto:jenishgangani238@gmail.com"
    },
    {
      id: 4,
      name: "Vandana Chari",
      role: "Team Member",
      image: "https://media.licdn.com/dms/image/v2/D5635AQG0eAE-MYasIQ/profile-framedphoto-shrink_400_400/B56ZhJAHTGHMAc-/0/1753571423686?e=1754197200&v=beta&t=deBaKIN-D5ahkIXu9_qMhCKsPWhnTwEqZ2ctVhu7it0",
      quote: "Building bridges through communication",
      linkedinURL: "https://www.linkedin.com/in/vandana1812/",
      email: "mailto:vandanachari1812@gmail.com"
    },
    {
      id: 5,
      name: "Abhinav Sinha",
      role: "Team Member",
      image: "https://media.licdn.com/dms/image/v2/D5603AQE8VW5oLP2j8Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1729097515590?e=1756339200&v=beta&t=LYZqAmqUEuhdCcbD7GH3m7lAWBGDD6BjUf8kn3AVseU",
      quote: "User experience is everything",
      linkedinURL: "https://www.linkedin.com/in/abhinav-sinha-48074b32b/",
      email: "mailto:sinhaabhinav337@gmail.com"
    }
  ];

  return (
    <div className="bg-gray-50 p-8">
      <div className="flex justify-start">
        <Link href="/">
          <button className="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-full">
             <i className="ri-dashboard-line text-lg"></i> Dashboard
          </button>
        </Link>
      </div>
      <h1 className="font-serif text-4xl text-center mb-2">Agenthium Team</h1>
      <p className="font-sans text-center text-gray-600 mb-12">Our team is on a mission to create inclusive, AI-powered tools that uplift educators in underserved communities. Inspired by the word "Agent" (a force for action) and "Ethium" (symbolizing ethics and impact), Agenthium stands for purposeful innovation—where technology serves, supports, and scales human potential.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex flex-col items-center">
              <img src={member.image} alt={member.name} className="w-24 h-24 rounded-full object-cover mb-4"/>
              <h2 className="font-sans text-xl font-bold">{member.name}</h2>
              <p className="font-mono text-sm text-gray-500 mb-2">{member.role}</p>
              <p className="font-serif italic text-gray-600 text-center mb-2">"{member.quote}"</p>
              <div className="font-mono text-sm text-blue-600">
                <div className="flex items-center gap-4">
                  <a href={member.linkedinURL}
                    target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" className="text-[#0077B5] transition-transform duration-300 hover:scale-110">
                    <FaLinkedin size={24} />
                  </a>
                  <a href={member.email} aria-label="Send an email"
                    className="text-[#D44638] transition-transform duration-300 hover:scale-110">
                    <FaEnvelope size={24} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
