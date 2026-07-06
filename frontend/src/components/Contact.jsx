import Footer from "./Footer";

export default function Contact() {
  return (
    <div>
        <section className="w-full h-[80vh] bg-gradient-to-b from-[#0b1220] to-[#060b16] py-20 text-center flex flex-col items-center justify-center px-4">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
        Get in Touch
      </h2>

      <p className="max-w-3xl mx-auto text-gray-400 text-lg leading-relaxed mb-4">
        Have a question, a bug report, or a feature request? Drop us a line
        below or email us directly.
      </p>

      <p className="text-lg text-gray-300">
        Email:{" "}
        <a
          href="mailto:parmarnakul277@gmail.com"
          className="text-orange-500 font-semibold hover:underline"
        >
          parmarnakul277@gmail.com
        </a>
      </p>
    </section>
    <Footer></Footer>
    </div>
  );
}
