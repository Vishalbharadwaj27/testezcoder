
const Stats = () => {
  const stats = [
    { value: "10x", label: "Faster debugging" },
    { value: "95%", label: "Accuracy rate" },
    { value: "50+", label: "Languages supported" },
    { value: "5sec", label: "Average fix time" }
  ];

  return (
    <section className="py-16 px-6 border-y border-border bg-secondary/20">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="group">
              <div className="text-3xl md:text-4xl font-bold text-electric group-hover:text-electric-bright transition-colors duration-300 mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
