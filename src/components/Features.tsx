
import { Zap, MessageSquare, Shield, Sparkles } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Instant Fix",
      subtitle: "Right-click → AI analyzes → Perfect code",
      description: "Select any problematic code, right-click, and let our AI instantly identify and fix issues with detailed explanations.",
      code: `// Before: Buggy code
const nums = [1,2,3]
nums.foreach(n => console.log(n))

// After: EZ-coder fix
const nums = [1,2,3]
nums.forEach(n => console.log(n))`
    },
    {
      icon: MessageSquare,
      title: "Comment-to-Code",
      subtitle: "Write comments, get perfect implementations",
      description: "Start any comment with //EZ: and watch it transform into production-ready code automatically.",
      code: `// EZ: Sort array by user age descending
const sortedUsers = users.sort((a, b) => b.age - a.age);

// EZ: Debounce search input with 300ms delay
const debouncedSearch = debounce(handleSearch, 300);`
    },
    {
      icon: Shield,
      title: "Secure & Private",
      subtitle: "Your code stays protected",
      description: "API keys stored securely in VS Code's secret storage. Your code is processed with enterprise-grade security.",
      code: `// Secure API integration
vscode.SecretStorage.store('ez-coder.apiKey', key);

// No code logging or storage
// Minimal context sharing`
    },
    {
      icon: Sparkles,
      title: "Smart Context",
      subtitle: "Language-aware AI assistance",
      description: "Understands TypeScript, JavaScript, Python, and more. Provides fixes and suggestions tailored to your specific language and framework.",
      code: `// TypeScript-aware fixes
interface User {
  id: number;
  name: string;
}

// Framework-specific suggestions for React, Vue, etc.`
    }
  ];

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-electric-bright bg-clip-text text-transparent">
            Two Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to code faster, fix bugs instantly, and transform ideas into perfect implementations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="feature-card group">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <feature.icon className="w-8 h-8 text-electric group-hover:text-electric-bright transition-colors duration-300" />
                  <div className="absolute inset-0 bg-electric rounded-full blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-electric text-sm font-medium">{feature.subtitle}</p>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {feature.description}
              </p>

              <div className="code-block group-hover:border-electric transition-colors duration-300">
                <pre className="text-sm leading-relaxed">
                  <code className="whitespace-pre-wrap">
                    {feature.code}
                  </code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
