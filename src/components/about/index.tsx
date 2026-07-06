import InstructorProfile from "./InstructorProfile"
import SanjeevsharmaImage from "../../assets/AboutUs/Images/sanjeevLNCT.png"
// import banner_video from "../../assets/Hero/Videos/Web-Video-1.mp4"
import hero_video from "../../assets/course_videos/Hero-banner.mp4";
import './styles/aboutus.css'
import TeamSection from "../team"

const index = () => {

    const instructorData = {
        name: "Sanjeev Sharma",
        title: "Instructor",
        bio: `He has been researching in motion planning, decision making under uncertainty and autonomous navigation since 2008.
            Over the past four years his research spanned across several areas of autonomous driving, including deep learning, computer vision, SLAM and visual odometry.
            He is a recipient of the AI Most Impact Global Smart Leaders Award in 2018. He is also a recipient of Top 40 Under 40 Data Scientist in India in 2019 award.
            His research at Swapapti Robots is to enable autonomous driving on Indian roads, has been covered by both the national and international media on several occasions.`,
        visionStatement: "Our vision is to educate a billion people & provide highest quality of knowledge through our courses, making cutting-edge education affordable and available to everyone",
        imageUrl: SanjeevsharmaImage,
    }

    return (
        <div className="about-us-wrapper">
            <div className="about-us-container">

                <div className="relative flex justify-center items-center h-[clamp(8rem,18vw,12rem)] w-full rounded-[1.25rem] overflow-hidden">
          <video
            className="absolute inset-0 w-full h-full object-cover z-0"
            src={hero_video}
            autoPlay
            loop
            muted
            playsInline
          ></video>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.4rem] z-[1]"></div>
          <h1 className="text-white uppercase tracking-[0.26em] font-semibold text-[clamp(1.5rem,2vw+1rem,2.5rem)] text-center z-[2]">
            Brilliance Initiated
          </h1>
        </div>
                <InstructorProfile {...instructorData} />
                <TeamSection />
            </div>
        </div>
    )
}

export default index