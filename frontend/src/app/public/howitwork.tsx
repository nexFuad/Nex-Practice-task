function PublicSection({
  id,
  eyebrow,
  title,
  description,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-18 border-t border-slate-200 bg-white px-5 py-20 sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-600">
          {eyebrow}
        </p>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          {description}
        </p>
      </div>
    </section>
  );
}

export function HowItWork() {
  return (
    <>
      <PublicSection
        id="dashboard"
        eyebrow="Live command center"
        title="The information your team needs, right when it matters."
        description="A clear dashboard keeps sites, teams, and incidents visible in real time."
      />
      <PublicSection
        id="facilities"
        eyebrow="Built for facilities"
        title="Security that scales with your portfolio."
        description="Give every location consistent procedures and give every stakeholder confidence."
      />
    </>
  );
}
