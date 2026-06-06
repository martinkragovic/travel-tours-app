export function Hero() {
  return (
    <section className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-[#333722] md:min-h-[420px]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.35)),url('/hero-mountains.jpg')] bg-cover bg-center" />

      <div className="relative z-10 px-6 text-center text-white">
        <h1 className="text-5xl font-black uppercase leading-none tracking-wide md:text-7xl">
          Туры в горы
        </h1>
        <p className="mt-3 text-2xl font-black uppercase tracking-[0.25em] md:text-3xl">
          по всему миру
        </p>
      </div>
    </section>
  );
}