import { BrainClassifier } from "@/components/brain-classifier"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#141414] relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <BrainClassifier />
    </main>
  )
}
