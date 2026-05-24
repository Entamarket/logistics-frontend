import styles from "./styles/Home.module.css";
import Image from "next/image";
import img1 from "../../public/images/hero_bg.png";
import img2 from "../../public/images/air_freight.png";
import img3 from "../../public/images/road_transport.png";
import person2 from "../../public/images/img.jpg";
import {
  FaGlobe,
  FaMapMarkedAlt,
  FaShippingFast,
  FaDollarSign,
  FaHeadset,
  FaQuoteLeft,
} from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import SiteFooter from "@/components/marketing/SiteFooter";
import HomeNav from "@/components/marketing/HomeNav";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />

        <div className={styles.heroInner}>
          <HomeNav />

        <div className={styles.heroContentWrapper}>
          <div className={styles.heroContent}>
            <h1>
              Your Reliable
              <br />
              Logistics Partner
            </h1>
            <p>
              From Easy delivery to fast-pick ups — we handle your entire
              logistics chain with precision.
            </p>
            <div className={styles.heroButtons}>
              <button type="button" className={styles.primaryBtn}>
                Get A Quote
              </button>
              <button type="button" className={styles.secondaryBtn}>
                Learn More
              </button>
            </div>
          </div>

          <div className={styles.trackingCard}>
            <div className={styles.trackingTabs}>
              <button type="button" className={styles.tabActive}>
                Tracking
              </button>
              <button type="button" className={styles.tab}>
                Schedules
              </button>
              <button type="button" className={styles.tab}>
                Offices
              </button>
            </div>

            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="trackingType"
                  className={styles.radioInput}
                  defaultChecked
                />
                Tracking ID or Number
              </label>
            </div>

            <div className={styles.inputGroup}>
              <svg
                className={styles.searchIcon}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Enter Tracking Number"
                className={styles.inputField}
              />
            </div>

            <button type="button" className={styles.searchBtn}>
              Search
            </button>
          </div>
        </div>

        <div className={styles.reviews}>
          <div className={styles.avatars}>
            <img
              src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100"
              className={styles.avatar}
              alt="User"
            />
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
              className={styles.avatar}
              alt="User"
            />
            <img
              src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=100"
              className={styles.avatar}
              alt="User"
            />
          </div>
          <span>
            143.4k+ <u>Customer Reviews</u>
          </span>
        </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsTitle}>
          <h2>Smart Logistics That Move Your Business</h2>
        </div>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <h3>1M+</h3>
            <p>1M+ Shipments Delivered</p>
          </div>
          <div className={styles.statItem}>
            <h3>150+</h3>
            <p>Countries Reached</p>
          </div>
          <div className={styles.statItem}>
            <h3>98%</h3>
            <p>98% On-Time Delivery Rate</p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className={styles.servicesGrid}>
        <div className={styles.serviceCard}>
          <span className={styles.cardNumber}>01</span>
          <h3>
            Consultation &<br />
            Planning
          </h3>
          <p>
            We Start By Understanding Your Unique Logistics Needs To Develop A
            Customized Plan That Maximizes Efficiency
          </p>
        </div>
        <div className={styles.serviceCard}>
          <span className={styles.cardNumber}>02</span>
          <h3>
            Inventory &<br />
            Warehousing
          </h3>
          <p>
            Secure Storage Solutions Tailored To Your Products, Ensuring Safe
            And Organized Inventory Management.
          </p>
        </div>
        <div className={styles.serviceCard}>
          <span className={styles.cardNumber}>03</span>
          <h3>
            Transportation &<br />
            Delivery
          </h3>
          <p>
            We Start By Understanding Your Unique Logistics Needs To Develop A
            Customized Plan That Maximizes Efficiency
          </p>
        </div>
        <div className={styles.serviceCard}>
          <span className={styles.cardNumber}>04</span>
          <h3>
            Tracking &<br />
            Communication
          </h3>
          <p>
            We Start By Understanding Your Unique Logistics Needs To Develop A
            Customized Plan That Maximizes Efficiency
          </p>
        </div>
      </section>

      <section className={styles.servBox}>
        <h1 className={styles.title}>
          Fast, Reliable & Secure <br />
          Transportation Services
        </h1>

        <div className={styles.imageContainer}>
          <div className={styles.card}>
            <Image
              src={img1}
              alt="Air Cargo"
              width={600}
              height={350}
              className={styles.image}
            />
          </div>

          <div className={styles.card}>
            <Image
              src={img2}
              alt="Port Cargo"
              width={600}
              height={350}
              className={styles.image}
            />
          </div>

          <div className={styles.card}>
            <Image
              src={img3}
              alt="Road Transport"
              width={600}
              height={350}
              className={styles.image}
            />
          </div>
        </div>
      </section>

      <section className={styles.section3}>
        <div className={styles.overlay}>
          <div className={styles.contBox}>
            <div className={styles.left}>
              <h2>Why Choose Us?</h2>
              <p>
                We Combine Global Reach, Real-Time Visibility, And Fast Delivery
                To Help Your Business Move Smarter.
              </p>

              <div className={styles.savings}>Up To 30% Cost Savings</div>
            </div>

            <div className={styles.right}>
              <div className={styles.item}>
                <FaGlobe className={styles.icon} />
                <div>
                  <h4>Global Network</h4>
                  <p>
                    Reliable International Routes With Trusted Shipping
                    Partners.
                  </p>
                </div>
              </div>

              <div className={styles.item}>
                <FaMapMarkedAlt className={styles.icon} />
                <div>
                  <h4>Real-Time Visibility</h4>
                  <p>Track Every Step — From Warehouse To Final Delivery.</p>
                </div>
              </div>

              <div className={styles.item}>
                <FaShippingFast className={styles.icon} />
                <div>
                  <h4>Fast & Secure Delivery</h4>
                  <p>Optimized Routes + Professional Handling.</p>
                </div>
              </div>

              <div className={styles.item}>
                <FaDollarSign className={styles.icon} />
                <div>
                  <h4>Cost-Efficient Solutions</h4>
                  <p>
                    Smart Planning That Reduces Unnecessary Costs And Delays.
                  </p>
                </div>
              </div>

              <div className={styles.item}>
                <FaHeadset className={styles.icon} />
                <div>
                  <h4>24/7 Customer Support</h4>
                  <p>
                    Always Ready To Assist With Shipment Updates And Requests.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>
          Trusted by Clients <br /> Worldwide
        </h2>

        <div className={styles.wrapper}>
          <div className={styles.arrow}>
            <FiChevronLeft />
          </div>

          <div className={styles.content}>
            <div className={styles.imageCard}>
              <Image
                src={person2}
                alt="Client"
                width={1000}
                height={1000}
              />
            </div>

            <div className={styles.testimonial}>
              <div className={styles.badge}>
                <div className={styles.avatars}>
                  <Image src={person2} width={28} height={28} alt="" />
                  <Image src={person2} width={28} height={28} alt="" />
                  <Image src={person2} width={28} height={28} alt="" />
                </div>
                <span>
                  Trusted By <strong>Happy Customers</strong>
                </span>
              </div>

              <FaQuoteLeft className={styles.quoteIcon} />

              <p className={styles.text}>
                &ldquo;We&apos;ve been working with this logistics company for
                over five years, and their service has been nothing short of
                exceptional. They consistently deliver our shipments on time,
                even under tight deadlines and complex routing.&rdquo;
              </p>

              <div className={styles.author}>
                <strong>Jane David</strong>
                <span>Supply Chain Manager</span>
              </div>

              <div className={styles.dots}>
                <span className={`${styles.dot} ${styles.active}`} />
                <span className={styles.dot} />
              </div>
            </div>
          </div>

          <div className={styles.arrow}>
            <FiChevronRight />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
