import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";

interface VideoResource {
  title: string;
  url: string;
  description: string;
}

interface TextResource {
  title: string;
  source: string;
  url: string;
  content: {
    introduction: string;
    key_areas: string[];
    development_process: Array<{
      stage: string;
      description: string;
    }>;
    cost_factors: string[];
    cost_ranges: {
      simple: string;
      medium: string;
      complex: string;
    };
    new_technologies: string[];
  };
}

interface AppDeveloperResourcesProps {
  videoResources: VideoResource[];
  textResources: TextResource[];
  interviewQuestions: string[];
}

export function AppDeveloperResources({ 
  videoResources, 
  textResources, 
  interviewQuestions 
}: AppDeveloperResourcesProps) {
  const [activeTab, setActiveTab] = useState<'videos' | 'text' | 'questions'>('videos');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'videos'
              ? 'border-violet-600 text-violet-600'
              : 'border-transparent text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Video Resources ({videoResources.length})
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'text'
              ? 'border-violet-600 text-violet-600'
              : 'border-transparent text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Learning Materials ({textResources.length})
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'questions'
              ? 'border-violet-600 text-violet-600'
              : 'border-transparent text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Interview Questions ({interviewQuestions.length})
        </button>
      </div>

      {/* Video Resources Tab */}
      {activeTab === 'videos' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {videoResources.map((video, index) => (
            <Card key={index} className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">{video.title}</h3>
                  <p className="text-sm text-zinc-600 mt-1">{video.description}</p>
                </div>
                <div className="aspect-video rounded-lg overflow-hidden bg-zinc-100">
                  <iframe
                    src={video.url}
                    title={video.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Text Resources Tab */}
      {activeTab === 'text' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {textResources.map((resource, index) => (
            <Card key={index} className="p-6">
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">{resource.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-zinc-600">Source: {resource.source}</span>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-violet-600 hover:text-violet-700 underline"
                    >
                      View Original
                    </a>
                  </div>
                </div>

                {/* Introduction */}
                <div>
                  <h4 className="text-lg font-semibold text-zinc-800 mb-2">Introduction</h4>
                  <p className="text-zinc-700 leading-relaxed">{resource.content.introduction}</p>
                </div>

                {/* Key Areas */}
                <div>
                  <h4 className="text-lg font-semibold text-zinc-800 mb-3">Key Areas in Mobile App Development</h4>
                  <ul className="space-y-2">
                    {resource.content.key_areas.map((area, areaIndex) => (
                      <li key={areaIndex} className="flex items-start gap-3">
                        <span className="h-2 w-2 rounded-full bg-violet-600 mt-2 flex-shrink-0" />
                        <span className="text-zinc-700">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Development Process */}
                <div>
                  <h4 className="text-lg font-semibold text-zinc-800 mb-3">Mobile App Development Process</h4>
                  <div className="space-y-4">
                    {resource.content.development_process.map((stage, stageIndex) => (
                      <div key={stageIndex} className="border-l-2 border-violet-200 pl-4">
                        <h5 className="font-semibold text-zinc-800">{stage.stage}</h5>
                        <p className="text-zinc-600 text-sm mt-1">{stage.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-zinc-800 mb-3">Cost Factors</h4>
                    <ul className="space-y-2">
                      {resource.content.cost_factors.map((factor, factorIndex) => (
                        <li key={factorIndex} className="text-sm text-zinc-700">
                          • {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-zinc-800 mb-3">Cost Ranges</h4>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-zinc-800">Simple:</span>
                        <span className="text-zinc-600 ml-2">{resource.content.cost_ranges.simple}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-zinc-800">Medium:</span>
                        <span className="text-zinc-600 ml-2">{resource.content.cost_ranges.medium}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-zinc-800">Complex:</span>
                        <span className="text-zinc-600 ml-2">{resource.content.cost_ranges.complex}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* New Technologies */}
                <div>
                  <h4 className="text-lg font-semibold text-zinc-800 mb-3">New Technologies in Mobile App Development</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {resource.content.new_technologies.map((tech, techIndex) => (
                      <div
                        key={techIndex}
                        className="bg-violet-50 border border-violet-200 rounded-lg px-3 py-2 text-center"
                      >
                        <span className="text-sm font-medium text-violet-800">{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Interview Questions Tab */}
      {activeTab === 'questions' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {interviewQuestions.map((question, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-violet-700">{index + 1}</span>
                </div>
                <p className="text-zinc-800 leading-relaxed">{question}</p>
              </div>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  );
}
