import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"
import api from "../../lib/api"

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: any) => any;
  }
}

interface Lecture {
  id: number
  title: string
  duration?: string
  course: string
  price?: number
  already_owned?: boolean
}

interface Assignment {
  id: number
  name: string
  assignment_type: string
  module_id: number
  section_url: string
  pdf: string
  course_title: string
}

interface Playlist {
  id: number
  title: string
  description: string
  total_price: number
  include_assignments: boolean
  is_purchased: boolean
  created_at: string
  lectures: Lecture[]
  assignments?: Assignment[]
  assignments_count?: number
}

interface User {
  name: string
  email: string
}

export default function PlaylistSummary() {
  const { playlistId } = useParams<{ playlistId: string }>()
  const navigate = useNavigate()

  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<User | null>(null)

  const [selectedDuration, setSelectedDuration] = useState<string>("1 Year")
  const [previewLoading, setPreviewLoading] = useState(false)
  const [displayTotalPrice, setDisplayTotalPrice] = useState(0)


  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const playlistRes = await api.get(`/customplaylist/details/${playlistId}/`)

        if (playlistRes.data.success) {
          setPlaylist(playlistRes.data.playlist)
          setUserData(playlistRes.data.user)
          setDisplayTotalPrice(parseFloat(playlistRes.data.playlist.total_price))
        } else {
          setError(playlistRes.data.message || "Failed to load playlist")
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "An error occurred while fetching data")
      } finally {
        setLoading(false)
      }
    }

    if (playlistId) {
      fetchData()
    }
  }, [playlistId])

  // Fetch updated pricing when duration changes
  useEffect(() => {
    const fetchPreview = async () => {
      if (!playlist || !playlistId) return

      try {
        setPreviewLoading(true)
        const response = await api.post("/customplaylist/preview/", {
          lecture_ids: playlist.lectures.map(l => l.id),
          duration: selectedDuration,
          include_assignments: playlist.include_assignments
        })

        if (response.data.success) {
          setDisplayTotalPrice(parseFloat(response.data.total_price))
          // Update individual lecture prices if needed
          setPlaylist(prev => {
            if (!prev) return null
            const updatedLectures = prev.lectures.map(l => {
              const previewLec = response.data.breakdown.find((b: any) => b.id === l.id)
              return previewLec ? { ...l, price: previewLec.price } : l
            })
            return { ...prev, lectures: updatedLectures }
          })
        }
      } catch (err) {
        console.error("Failed to fetch price preview", err)
      } finally {
        setPreviewLoading(false)
      }
    }

    if (!loading && playlist) {
      fetchPreview()
    }
  }, [selectedDuration, playlistId, loading])






  const handlePayment = async () => {
    if (!playlist || !userData) return;

    try {
      setPaymentLoading(true);

      const initRes = await api.post(
        `/customplaylist/initiate_payment/${playlistId}/`,
        {
          duration: selectedDuration,
        }
      );

      if (!initRes.data.success) {
        toast.error(initRes.data.message || "Failed to initiate payment");
        return;
      }

      const orderData = initRes.data.data;

      const options = {
        key: orderData.razorpay_key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Deep Eigen",
        description: `Payment for ${playlist.title}`,
        order_id: orderData.razorpay_order_id,

        handler: async (response: any) => {
          try {
            const verifyRes = await api.post(
              `/customplaylist/verify_payment/${playlistId}/`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            if (verifyRes.data.success) {
              toast.success("Payment Successful");
              navigate("/user_dashboard", {
                state: { activeSection: "playlist" },
              });
            } else {
              toast.error("Payment verification failed");
            }
          } finally {
            setPaymentLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Payment failed");
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e9effb] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading playlist details...</p>
        </div>
      </div>
    )
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen bg-[#e9effb] flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <p className="text-red-500 font-medium mb-4">{error || "Playlist not found"}</p>
          <button onClick={() => navigate(-1)} className="text-blue-600 font-semibold">Go Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className=" font-bricolage sm:max-w-[84vw] max-w-[100vw]  md:max-w-[88vw] lg:max-w-[84vw] mx-auto min-h-screen bg-white
     px-2 sm:px-4 md:px-8 lg:px-12 py-4 sm:py-6 md:py-10">
      {/* Back */}
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center font-bold   gap-2 text-gray-700 mb-6 hover:text-blue-600 transition-colors"
      >
        <i className="ri-arrow-left-line text-xl"></i><span className="text-base font-bold">Go back</span>
      </button>

      {/* Card */}
      <div className="max-w-full md:max-w-[83vw] lg:max-w-[83.5vw] mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-5 sm:p-8 mb-10 md:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {playlist.title}
          </h1>
          <span className="text-sm text-gray-500 font-semibold bg-gray-100 px-3 py-1 rounded-full w-fit">
            Order ID: #{playlist.id}
          </span>
        </div>

        {/* Name / Email */}
        <div className="bg-[#f8faff] rounded-xl border border-blue-50/50 px-3 py-4 flex flex-col md:flex-row md:justify-between gap-3 mb-10">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Name: </span>{userData?.name}
          </p>
          <p className="text-sm text-gray-700 break-all">
            <span className="font-semibold text-gray-900">Registered Email: </span>
            {userData?.email}
          </p>
        </div>

        {/* Subscription */}
        <div className="mb-10 ">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Subscribe for
          </h2>

          <div className="flex item-start bg-gray-50 text-start p-1 rounded-full border border-gray-100 overflow-x-auto scrollbar-hide w-fit">
            {[
              ["1 Month", "1 Month"],
              ["4 Months", "4 Months"],
              ["12 Months", "12 Months"],
            ].map(([key, label]) => (
              <button
                key={key}
                disabled={previewLoading}
                onClick={() => setSelectedDuration(key)}
                className={`px-3 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap
                  ${selectedDuration === key
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "text-gray-600 hover:text-gray-900"
                  } ${previewLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>


        {/* Lectures */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-5">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              Selected Lectures ({playlist.lectures.length})
            </h3>
            <span className={`text-lg sm:text-xl font-bold text-gray-700 ${previewLoading ? "animate-pulse" : ""}`}>
              ₹{playlist.lectures.reduce((sum, l) => sum + parseFloat(String(l.price || 0)), 0).toFixed(2)}
            </span>
          </div>

          <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar scrollbar-hide">
            {playlist.lectures.map(l => (
              <div
                key={l.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border
                 transition-all bg-white border-gray-300 hover:border-blue-200 "


              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 shrink-0 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    ▶
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base text-gray-900 font-semibold leading-snug line-clamp-2">
                      {l.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      {l.course} • {l.duration || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end sm:justify-start">
                  <span className="text-sm sm:text-base text-gray-900 font-bold whitespace-nowrap">
                    ₹{l.price ? parseFloat(String(l.price)).toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* Assignment */}
        {playlist.include_assignments && (
          <div className="py-8 border-t border-gray-100">
            <div className="flex justify-between items-end mb-5">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                Custom Assignments ({playlist.assignments_count || 0})
              </h3>
              <span className="text-lg sm:text-xl font-bold text-gray-700">
                ₹{(100 * (playlist.assignments_count || 0) * (selectedDuration.includes("Month") ? parseInt(selectedDuration) : (selectedDuration.includes("Year") ? 12 : 1))).toFixed(2)}
              </span>
            </div>

            {playlist.assignments && playlist.assignments.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3 border border-gray-100">
                {playlist.assignments.map(asgn => (
                  <div key={asgn.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-300 shadow-sm">
                    <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded flex items-center justify-center text-xs">

                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-2">{asgn.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-tight">{asgn.course_title} • {asgn.assignment_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(!playlist.assignments || playlist.assignments.length === 0) && (
              <p className="text-xs text-gray-400 italic font-medium px-2">
                Assignments will be calculated based on selected lectures.
              </p>
            )}
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center py-6 border-t border-gray-100 bg-blue-50/30 px-5 -mx-5 sm:px-8 sm:-mx-8 md:px-10 md:-mx-10">
          <h3 className="text-lg font-bold text-gray-900">Grand Total</h3>
          <div className="text-right">
            <span className={`text-2xl sm:text-3xl font-black text-blue-600 ${previewLoading ? "animate-pulse" : ""}`}>
              ₹{displayTotalPrice.toFixed(2)}
            </span>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Inclusive of all taxes</p>
          </div>
        </div>

        {/* Pay */}
        <button
          onClick={handlePayment}
          disabled={
            playlist.is_purchased ||
            previewLoading ||
            paymentLoading
          }
          className="w-full mt-8 bg-[#174CD2] text-white py-3 rounded-xl text-md font-semibold hover:bg-blue-700 active:scale-[0.99] shadow-lg shadow-blue-100 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
        >
          {playlist.is_purchased ? (
            "PLAYLIST ALREADY PURCHASED"
          ) : paymentLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : previewLoading ? (
            "CALCULATING BEST PRICE..."
          ) : (
            `PAY ₹${displayTotalPrice.toFixed(2)}`
          )}
        </button>
      </div>
    </div>
  )
}
