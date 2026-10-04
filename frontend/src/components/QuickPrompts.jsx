import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

export default function QuickPrompts({ onSelectPrompt }) {
  const prompts = [
    { text: "What is the B.Tech fee structure?", lang: "English" },
    { text: "My rank is 18000 OBC, can I get CSE?", lang: "Eligibility" },
    { text: "B.Tech പ്രവേശന പ്രക്രിയ എന്താണ്?", lang: "Malayalam" },
    { text: "बीटेक प्रवेश प्रक्रिया क्या है?", lang: "Hindi" },
    { text: "What are the hostel and mess facilities?", lang: "English" },
    { text: "B.Tech ప్రవేశ ప్రక్రియ ఏమిటి?", lang: "Telugu" },
    { text: "B.Tech சேர்க்கை செயல்முறை என்ன?", lang: "Tamil" },
  ];

  return (
    <div className="quick-prompts-container">
      {prompts.map((p, idx) => (
        <button
          key={idx}
          className="prompt-chip"
          onClick={() => onSelectPrompt(p.text)}
        >
          <Sparkles size={13} color="#60a5fa" />
          <span>{p.text}</span>
        </button>
      ))}
    </div>
  );
}
