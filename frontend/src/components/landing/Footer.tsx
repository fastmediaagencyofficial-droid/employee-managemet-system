export default function Footer() {
    return (
        <footer className="bg-black text-white py-12 border-t border-gray-800">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-lg">
                                ⚡
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                FAST <span className="text-yellow-500">GROUP</span>
                            </span>
                        </div>
                        <p className="text-gray-400 max-w-xs">
                            Driving innovation and excellence in digital solutions for businesses worldwide.
                        </p>
                    </div>

                    {/* Company and Legal sections removed as per request */}
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} Fast Group of Companies. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
