"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SyncMediaButton } from "@/components/studio/SyncMediaButton";
import { useState } from "react";

export default function MediaLibraryPage() {
    const media = useQuery(api.studio.mediaQueries.getAllMedia);
    const [search, setSearch] = useState("");

    if (media === undefined) return <div className="p-8 text-gray-500 animate-pulse">Loading Media Library...</div>;

    const filtered = media.filter(item =>
        item.publicId.toLowerCase().includes(search.toLowerCase()) ||
        (item.folder && item.folder.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
                    <p className="text-gray-500 text-sm">Manage assets synced from Cloudinary</p>
                </div>
                <div className="flex gap-2">
                    <SyncMediaButton />
                </div>
            </header>

            {/* Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <input
                    type="text"
                    placeholder="Search media by ID or folder..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filtered.map(item => (
                    <div key={item._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden group hover:shadow-lg transition-all duration-300">
                        <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
                            {item.resourceType === 'video' ? (
                                <video
                                    src={item.url}
                                    className="w-full h-full object-cover"
                                    muted
                                    loop
                                    playsInline
                                    onMouseOver={e => e.currentTarget.play()}
                                    onMouseOut={e => e.currentTarget.pause()}
                                />
                            ) : (
                                <img src={item.url} className="w-full h-full object-cover" loading="lazy" />
                            )}

                            {/* Copy Link Action */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(item.url);
                                        alert("URL Copied!");
                                    }}
                                    className="px-3 py-1 bg-white text-black text-xs font-bold rounded hover:bg-gray-200"
                                >
                                    Copy URL
                                </button>
                            </div>
                        </div>
                        <div className="p-3 text-xs">
                            <div className="font-bold truncate text-gray-800" title={item.publicId}>{item.publicId}</div>
                            <div className="text-gray-500 truncate mt-1">{item.folder || "Root"}</div>
                            <div className="text-gray-400 mt-2 flex justify-between items-center bg-gray-50 p-1 rounded">
                                <span className="uppercase">{item.format}</span>
                                <span>{item.width}x{item.height}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    No media found. Try syncing or check your search.
                </div>
            )}
        </div>
    );
}
