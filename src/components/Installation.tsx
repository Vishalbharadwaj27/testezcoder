
import { Button } from "@/components/ui/button";
import { Copy, Download, Terminal } from "lucide-react";
import { useState } from "react";

const Installation = () => {
  const [copied, setCopied] = useState(false);
  
  const copyCommand = () => {
    navigator.clipboard.writeText("code --install-extension ez-coder");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-electric-bright bg-clip-text text-transparent">
          Get Started in Seconds
        </h2>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Install EZ-coder and start coding smarter immediately. No configuration required.
        </p>

        <div className="max-w-3xl mx-auto space-y-8">
          {/* Command line installation */}
          <div className="feature-card text-left">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-6 h-6 text-electric" />
              <h3 className="text-xl font-semibold">Command Line Installation</h3>
            </div>
            <div className="code-block relative group">
              <code className="text-electric-bright">code --install-extension ez-coder</code>
              <Button
                onClick={copyCommand}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {copied && (
              <p className="text-green-500 text-sm mt-2 animate-fade-in">✓ Copied to clipboard!</p>
            )}
          </div>

          {/* Or visual installation */}
          <div className="text-muted-foreground">— or —</div>

          <div className="feature-card">
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-6 h-6 text-electric" />
              <h3 className="text-xl font-semibold">VS Code Marketplace</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Search for "EZ-coder" in the VS Code Extensions panel and install with one click.
            </p>
            <Button className="bg-electric hover:bg-electric-bright text-primary-foreground font-semibold px-6 py-2 rounded-lg transition-all duration-300">
              Open in VS Code
            </Button>
          </div>

          {/* Quick setup */}
          <div className="feature-card">
            <h3 className="text-xl font-semibold mb-4">Quick Setup</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-electric rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground mt-0.5">1</div>
                <p className="text-muted-foreground">Install the extension</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-electric rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground mt-0.5">2</div>
                <p className="text-muted-foreground">Set your AI API key (OpenAI/Anthropic/Gemini)</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-electric rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground mt-0.5">3</div>
                <p className="text-muted-foreground">Start coding with AI superpowers!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Installation;
