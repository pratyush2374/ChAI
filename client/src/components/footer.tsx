import socialIcons from "@/lib/social";

const Footer: React.FC = () => {
    return (
        <>
            <footer className="border-t border-gray-800 py-3">
                <div className="container mx-auto max-w-4xl px-6">
                    <div className="flex items-end justify-center space-x-6">
                        {socialIcons.map((icon) => (
                            <a
                                key={icon.name}
                                href={icon.target}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group transition-transform duration-300"
                                aria-label={icon.name}
                            >
                                <div className="w-4 h-4 relative overflow-hidden">
                                    <img
                                        src={icon.path}
                                        alt={icon.name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;
