export default function Footer() {
  return (
    <footer
      className="bg-transparent text-gray-300 text-center py-6 mt-10
                 border-t border-white/10 backdrop-blur-md"
    >
      <p>
        © {new Date().getFullYear()}{" "}
        <span className="text-purple-400 font-semibold">BakeHub</span>. 
        All rights reserved.
      </p>
    </footer>
  );
}
