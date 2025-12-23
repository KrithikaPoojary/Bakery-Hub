export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 text-center py-6 mt-10 border-t border-gray-800">
      <p>© {new Date().getFullYear()} BakeHub. All rights reserved.</p>
    </footer>
  );
}
