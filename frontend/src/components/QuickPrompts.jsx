import React from 'react';
import { Sparkles, MapPin } from 'lucide-react';

export default function QuickPrompts({ onSelectPrompt }) {
  const prompts = [
    { text: "Where is room BC304 located?", category: "map" },
    { text: "Where is Scoops snack shop and Medical Room?", category: "map" },
    { text: "Where is Milma and the student Mess?", category: "map" },
    { text: "How does room numbering work in Old vs New Academic Block?", category: "map" },
    { text: "What is the B.Tech fee structure?", category: "fees" },
    { text: "B.Tech പ്രവേശന പ്രക്രിയ എന്താണ്?", category: "malayalam" },
    { text: "My rank is 18000 OBC, can I get CSE?", category: "eligibility" },
    { text: "बीटेक प्रवेश प्रक्रिया क्या है?", category: "hindi" },
  ];

  return (
    <div className="quick-prompts-container">
      {prompts.map((p, idx) => (
        <button
          key={idx}
          className="prompt-chip"
          onClick={() => onSelectPrompt(p.text)}
        >
          {p.category === 'map' ? (
            <MapPin size={13} className="text-emerald-400" />
          ) : (
            <Sparkles size={13} className="text-blue-400" />
          )}
          <span>{p.text}</span>
        </button>
      ))}
    </div>
  );
}
