
import { Button } from "@/components/ui/button";
import { Code2, Download, Star } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient opacity-10" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-2 h-2 bg-electric rounded-full animate-pulse" />
        <div className="absolute top-40 right-32 w-1 h-1 bg-electric-bright rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-electric rounded-full animate-pulse delay-500" />
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-electric-bright rounded-full animate-pulse delay-1500" />
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Code2 className="w-16 h-16 text-electric animate-glow-pulse" />
            <div className="absolute inset-0 bg-electric rounded-full blur-xl opacity-20 animate-pulse" />
          </div>
        </div>

        {/* Main headline */}
        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-electric-bright to-foreground bg-clip-text text-transparent">
          EZ-coder
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
          The AI-powered VS Code extension that transforms your coding workflow
        </p>
        
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
          Fix code instantly with right-click AI analysis. Convert comments to perfect code automatically. 
          Built for developers who code at the speed of thought.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-16">
          <Button size="lg" className="bg-electric hover:bg-electric-bright text-primary-foreground font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 electric-glow">
            <Download className="w-5 h-5 mr-2" />
            Install Extension
          </Button>
          
          <Button variant="outline" size="lg" className="border-electric text-electric hover:bg-electric hover:text-primary-foreground font-semibold px-8 py-3 rounded-xl transition-all duration-300">
            <Star className="w-5 h-5 mr-2" />
            View on GitHub
          </Button>
        </div>

        {/* Code preview window */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl">
            {/* Window header */}
            <div className="bg-secondary px-4 py-3 border-b border-border flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="ml-4 text-sm text-muted-foreground font-mono">
                main.ts — EZ-coder Demo
              </div>
            </div>
            
            {/* Code content */}
            <div className="p-6 bg-code-bg">
              <pre className="text-left text-sm leading-relaxed">
                <code className="animate-code-appear">
                  <span className="syntax-comment">// EZ: Create a function to validate email addresses</span>{'\n'}
                  <span className="syntax-keyword">function</span> <span className="text-electric-bright">validateEmail</span>(<span className="text-foreground">email</span>: <span className="syntax-keyword">string</span>): <span className="syntax-keyword">boolean</span> {'{'}
                  {'\n'}  <span className="syntax-keyword">const</span> <span className="text-foreground">emailRegex</span> = <span className="syntax-string">/^[^\s@]+@[^\s@]+\.[^\s@]+$/</span>;
                  {'\n'}  <span className="syntax-keyword">return</span> <span className="text-foreground">emailRegex</span>.<span className="text-electric">test</span>(<span className="text-foreground">email</span>);
                  {'\n'}{'}'}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
