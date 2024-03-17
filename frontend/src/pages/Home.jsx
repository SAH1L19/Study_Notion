import React from 'react'
import { Link } from 'react-router-dom';
import {FaArrowRight} from "react-icons/fa"
import HighlightText from '../components/core/HomePage/HighlightText';
import CTAButton from "../components/core/HomePage/Button";
import Banner from  "../assets/Images/banner.mp4";
import CodeBlocks from '../components/core/HomePage/CodeBlocks';
import { TypeAnimation } from 'react-type-animation';



const Home = () => {


  return (
     // container
    <div>
    
        {/* section-1 (whole black ) */}
        <section className='relative mx-auto flex flex-col w-11/12 items-center text-white justify-between max-w-maxContent'>

{/* BUTTON */}
            <Link to={"/signup"}>

  
            <div className='group mt-16 p-1 mx-auto rounded-full bg-richblack-800 font-bold text-richblack-200 transition-all duration-200 hover:scale-95 w-fit cursor-pointer '>

          
                <div className='flex flex-row items-center gap-3 rounded-full px-10 py-[5px] transition-all duration-200 group-hover:bg-richblack-900'>
                    <p>Become an Instructor</p>
                    <FaArrowRight/>
                    
                </div>
            </div>

            </Link>

           {/* Heading */}
           <h1 className='text-center text-4xl font-semibold mt-6'>
           Empower Your Future with
          <HighlightText text={"Coding Skills"} />

           </h1>

{/* small para */}
           <div className='w-[90%] text-center text-lg font-bold mt-4 text-richblack-300'>
           With our online coding courses, you can learn at your own pace, from
          anywhere in the world, and get access to a wealth of resources,
          including hands-on projects, quizzes, and personalized feedback from
          instructors.
           </div>
{/* 2 btns side by side */}
        <div className='flex flex-row gap-7 mt-8'>
            <CTAButton active={true} linkto={'signup'}>
                Learn More
            </CTAButton>
            <CTAButton active={false} linkto={'login'}>
                Book a Demo
            </CTAButton>
        </div>
{/* video */}
        <div className='mx-3 my-12 shadow-blue-200 relative '>
        {/* shdadow */}
        <div className='bg-custom-gradient-0 w-full h-full opacity-md blur-xl absolute z-0 top-n8'></div>
            <video muted loop auto autoPlay className='transform z-20'>
            <source  src={Banner} type="video/mp4"/>
            </video>
        </div>

    {/* code segment -1  */}
      <div>
        <CodeBlocks position={"lg:flex-row"}
            heading={
                <div className='font-inter text-3xl font-semibold leading-0  tracking-tight'>
                    Unlock Your <HighlightText text={"coding potential"}/> with our online resources
                </div>
            }
            subheading= {"Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."}
            ctabtn1={{
                btnText :"try it yourself",
                linkto :"/signup",
                active:true,
            }}
            ctabtn2={{
                btnText :"try it yourself",
                linkto :"/login",
                active:false,
            }}
            codeblock={`<!DOCTYPE html>\n<html>\nhead><>Example</\ntitle><linkrel="stylesheet"href="styles.css">\n/head>\nbody>\nh1><ahref="/">Header</a>\n/h1>\nnav><ahref="one/">One</a><ahref="two/">Two</\na><ahref="three/">Three</a>\n/nav>`}

            codeColor={"text-richblack-50"}
            backgroundGradient={
              "bg-gradient-to-r from-pure-greys-600 via-yellow-400 to-pink-200 "
            }/>
      </div> 
     {/* code segment -2  */}
     <div>
        <CodeBlocks position={"lg:flex-row-reverse"}
            heading={
                <div className='font-inter text-3xl font-semibold leading-0  tracking-tight'>
                     Start <HighlightText text={"coding in seconds "}/>
                </div>
            }
            subheading={
              "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."
            }
            ctabtn1={{
                btnText :"Continue Lesson",
                linkto :"/signup",
                active:true,
            }}
            ctabtn2={{
                btnText :"Learn More",
                linkto :"/login",
                active:false,
            }}
            codeblock={`<!DOCTYPE html>\n<html>\nhead><>Example</\ntitle><linkrel="stylesheet"href="styles.css">\n/head>\nbody>\nh1><ahref="/">Header</a>\n/h1>\nnav><ahref="one/">One</a><ahref="two/">Two</\na><ahref="three/">Three</a>\n/nav>`}

            codeColor={"text-richblack-50"}
            backgroundGradient={
              "bg-gradient-to-r from-pure-greys-600 via-yellow-400 to-pink-200 "
            }/>
      </div>



        </section>



        {/* section-2  */}
        {/* sectinon-3 */}
        {/* footer */}
    </div>
  )
}
export default Home;