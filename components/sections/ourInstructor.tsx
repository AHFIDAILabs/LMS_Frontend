import { useState } from "react"
import { Instructor } from "@/types/instructor"
import { Badge } from "@/components/ui/Badge"

import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation, EffectCoverflow } from "swiper/modules"

import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "swiper/css/effect-coverflow"

export function InstructorsSection({
  instructors,
  isAdminPreview = false,
}: {
  instructors: Instructor[]
  isAdminPreview?: boolean
}) {
  const [selected, setSelected] = useState<Instructor | null>(null)

  return (
    <section className="relative p-10 bg-linear-to-b from-slate-800/95 via-slate-700/90 to-slate-600/85 overflow-hidden">

      {/* Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#EFB14A]/10 blur-[140px] rounded-full" />

      <div className="container-custom relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge
            variant="primary"
            className="mb-6 bg-white text-[#EFB14A] border-[#EFB14A]"
          >
            Our Experts
          </Badge>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Meet Our Instructors
          </h2>

          <p className="text-gray-300 text-lg">
            Learn from industry professionals.
          </p>
        </div>

        {/* Carousel */}
        <Swiper
          modules={[
            Autoplay,
            Pagination,
            Navigation,
            EffectCoverflow,
          ]}
          effect="coverflow"
          grabCursor
          centeredSlides
          loop
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{ clickable: true }}
          navigation
          spaceBetween={30}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {instructors.map((inst) => (
            <SwiperSlide key={inst.id}>
              <div
                onClick={() => setSelected(inst)}
                className="
                  bg-slate-900/90
                  border border-gray-700
                  rounded-2xl
                  p-8
                  text-center
                  hover:border-[#EFB14A]/60
                  transition
                  group
                  h-full
                  cursor-pointer
                "
              >

                {/* Image */}
                <div className="w-28 h-28 mx-auto mb-6 relative">
                  <img
                    src={inst.avatar}
                    alt={inst.name}
                    className="
                      w-full h-full
                      object-cover
                      rounded-full
                      border-4 border-[#EFB14A]
                      shadow-[0_0_30px_rgba(239,177,74,0.35)]
                    "
                  />

                  {isAdminPreview && (
                    <span className="
                      absolute -top-2 -right-2
                      bg-red-500 text-white
                      text-xs px-2 py-1
                      rounded-full
                    ">
                      ADMIN
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#EFB14A] transition">
                  {inst.name}
                </h3>

                <p className="text-sm text-[#EFB14A] mb-2">
                  {inst.title}
                </p>

                {/* Rating */}
                <div className="flex justify-center gap-1 mb-3">
                  {[1,2,3,4,5].map((i) => (
                    <span
                      key={i}
                      className={
                        i <= Math.round(inst.rating)
                          ? "text-[#EFB14A]"
                          : "text-gray-600"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>

                <p className="text-xs text-gray-400 mb-3">
                  {inst.rating} rating • {inst.reviews} reviews
                </p>

                {/* Bio */}
                <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                  {inst.bio}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap justify-center gap-2">
                  {inst.qualifications.map((q, idx) => (
                    <span
                      key={idx}
                      className="
                        text-xs
                        bg-[#EFB14A]/10
                        text-[#EFB14A]
                        px-3 py-1
                        rounded-full
                        border border-[#EFB14A]/30
                      "
                    >
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* MODAL PROFILE */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 max-w-xl w-full rounded-2xl p-8 relative"
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <div className="text-center">
              <img
                src={selected.avatar}
                className="
                  w-32 h-32 mx-auto
                  rounded-full
                  border-4 border-[#EFB14A]
                  mb-4
                "
              />

              <h3 className="text-2xl font-bold text-white mb-1">
                {selected.name}
              </h3>

              <p className="text-[#EFB14A] mb-3">
                {selected.title}
              </p>

              {/* Rating */}
              <div className="flex justify-center gap-1 mb-2">
                {[1,2,3,4,5].map((i) => (
                  <span
                    key={i}
                    className={
                      i <= Math.round(selected.rating)
                        ? "text-[#EFB14A]"
                        : "text-gray-600"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>

              <p className="text-gray-400 text-sm mb-4">
                {selected.rating} rating • {selected.reviews} reviews
              </p>

              <p className="text-gray-300 mb-5">
                {selected.bio}
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                {selected.qualifications.map((q, i) => (
                  <span
                    key={i}
                    className="
                      text-xs
                      bg-[#EFB14A]/10
                      text-[#EFB14A]
                      px-3 py-1
                      rounded-full
                      border border-[#EFB14A]/30
                    "
                  >
                    {q}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
