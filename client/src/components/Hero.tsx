// Basic Hero component with grid background

export function Hero() {
    return (
        <div className="relative w-full h-screen bg-white">
            <div className="absolute inset-0 h-full w-full bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>
    );
}
