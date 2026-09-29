import os
import sys

# Ensure current directory is on python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.database import get_database, ensure_indexes, close_connection
from app.core.security import hash_password
from datetime import datetime, timezone

def seed_database():
    print("Connecting to MongoDB...")
    db = get_database()
    
    # Verify connectivity
    db.command("ping")
    print("MongoDB connection successful.")
    
    # Ensure indexes exist
    ensure_indexes()
    print("Indexes verified.")

    try:
        # 1. Seed Admin
        admin_email = "admin@example.com"
        admin = db.admins.find_one({"email": admin_email})
        if not admin:
            admin_doc = {
                "name": "Dhankranti Admin",
                "email": admin_email,
                "password_hash": hash_password("Admin@123"),
                "created_at": datetime.now(timezone.utc)
            }
            db.admins.insert_one(admin_doc)
            print("Created default admin: admin@example.com / Admin@123")
        else:
            db.admins.update_one(
                {"_id": admin["_id"]},
                {"$set": {"name": "Dhankranti Admin"}}
            )
            print("Admin already exists (updated display name).")

        # 2. Seed Dhankranti Demo Shop
        google_review_url = (
            "https://www.google.com/search?hl=en-IN&gl=in&q=Dhankranti+share+Market+classes,"
            "+Dhankranti+share+market+,+Bhadale+complex,+Near+KK+care+Hospital+Tapkir+Chowk,"
            "Bhosari+alandi+Road,+Wadmukhwadi+412105+PCMC,+Pune,+Maharashtra+412105"
            "&ludocid=8701389214391986374&lsig=AB86z5XloSRd8OQU2a74Jay27TVo#lrd=0x3bc2c747e4044c15:0x78c18b63783fe8c6,3"
        )

        now = datetime.now(timezone.utc)
        shop = db.shops.find_one({"slug": "dhankranti"})
        if not shop:
            # Check if an existing primary shop exists
            shop = db.shops.find_one()
            if shop:
                db.shops.update_one(
                    {"_id": shop["_id"]},
                    {"$set": {
                        "name": "Dhankranti Share Market Classes",
                        "slug": "dhankranti",
                        "tagline": "Share Market & Trading Education",
                        "review_url": google_review_url,
                        "qr_token": "dhankranti",
                        "is_active": True,
                        "updated_at": now
                    }}
                )
                shop = db.shops.find_one({"_id": shop["_id"]})
                print("Updated existing primary shop to Dhankranti.")
            else:
                shop_doc = {
                    "name": "Dhankranti Share Market Classes",
                    "slug": "dhankranti",
                    "tagline": "Share Market & Trading Education",
                    "review_url": google_review_url,
                    "qr_token": "dhankranti",
                    "is_active": True,
                    "created_at": now,
                    "updated_at": now
                }
                result = db.shops.insert_one(shop_doc)
                shop_doc["_id"] = result.inserted_id
                shop = shop_doc
                print("Created shop: Dhankranti Share Market Classes (qr_token: dhankranti)")
        else:
            db.shops.update_one(
                {"_id": shop["_id"]},
                {"$set": {
                    "name": "Dhankranti Share Market Classes",
                    "tagline": "Share Market & Trading Education",
                    "review_url": google_review_url,
                    "qr_token": "dhankranti",
                    "is_active": True,
                    "updated_at": now
                }}
            )
            shop = db.shops.find_one({"_id": shop["_id"]})

        shop_id = shop["_id"]

        # 3. Seed 8 categories and 10 reviews each
        target_categories = [
            {
                "name": "Teaching Quality",
                "description": "Clarity of concepts and teaching methodology.",
                "icon": "graduation-cap",
                "reviews": [
                    "Ram Sir explains complex market concepts in a very simple and structured way. The sessions are easy to follow even for someone without a finance background.",
                    "The conceptual clarity provided during lectures is exceptional. Difficult chart patterns are broken down into easy-to-understand rules.",
                    "Really impressed by the teaching methodology. The focus is always on understanding market logic rather than blind indicators.",
                    "The faculty takes time to ensure every student understands the rationale behind price movements. Great teaching standards.",
                    "The lectures are very engaging and informative. Complex topics like risk-to-reward ratios and price action are taught clearly.",
                    "Excellent way of explaining candlestick patterns and trend analysis. The examples used in class make everything click.",
                    "High quality instruction with clear emphasis on market discipline and emotional control during trades.",
                    "The teaching style is patient and thorough. Every core concept of technical analysis is covered with proper depth.",
                    "I appreciate how Ram Sir simplifies technical terms into everyday language. Makes learning the stock market enjoyable.",
                    "Structured and transparent teaching approach. You learn how the market actually works step by step."
                ]
            },
            {
                "name": "Practical Learning",
                "description": "Hands-on chart analysis and market applications.",
                "icon": "line-chart",
                "reviews": [
                    "I liked the practical approach to learning. The concepts become much easier to understand when they are connected with real market examples.",
                    "Focusing on live charts instead of just book theory made a huge difference in my understanding of price action.",
                    "The practical assignments helped me identify support and resistance levels on my own with confidence.",
                    "Great emphasis on hands-on chart reading. We analyze actual historical and current setups during class.",
                    "Learning how to read volume and price action practically has completely changed the way I look at charts.",
                    "The practical case studies shared during the course helped me understand market trends much better.",
                    "Practical exercises on risk management and position sizing gave me a clear framework to manage trades.",
                    "Hands-on chart practice after every lecture helped reinforce what was taught. Very practical curriculum.",
                    "Real chart examples are discussed in every session, which builds real confidence for analyzing the market.",
                    "The practical exposure to analyzing market trends and chart setups is the biggest strength of Dhankranti."
                ]
            },
            {
                "name": "Supportive Mentors",
                "description": "Patient guidance and personalized mentor support.",
                "icon": "users",
                "reviews": [
                    "The mentors are supportive and patiently clear doubts. I found the overall learning environment very comfortable.",
                    "Whenever I was confused about a setup, the mentors guided me through the reasoning without any hesitation.",
                    "Extremely approachable faculty. They genuinely care about student progress and encourage questions.",
                    "The mentors provide continuous guidance and constructive feedback on our chart analysis.",
                    "Supportive team that is always ready to help students overcome their initial hesitation in the market.",
                    "The personalized attention from mentors during practice sessions helped me correct my analysis mistakes.",
                    "Very polite and helpful mentors. You never feel judged for asking basic questions.",
                    "Having experienced mentors to guide you through market fundamentals makes the learning curve much smoother.",
                    "Mentors are always accessible for guidance even after class hours. Truly dedicated team.",
                    "The mentorship and encouragement I received here gave me clarity and confidence in my learning journey."
                ]
            },
            {
                "name": "Beginner Friendly",
                "description": "Step-by-step foundation for stock market beginners.",
                "icon": "sprout",
                "reviews": [
                    "I joined with very little knowledge about the stock market. The concepts were explained step by step, which made learning much easier.",
                    "Perfect institute for complete beginners. Everything starts from zero, explaining terminology in simple terms.",
                    "As someone from a non-commerce background, I was worried, but the course is structured so well that anyone can understand.",
                    "Step-by-step guidance from the absolute basics of the stock market to intermediate technical analysis.",
                    "No prior finance knowledge needed. They explain demat accounts, orders, and charts from ground up.",
                    "Very patient pace for newcomers. They ensure everyone in the batch is on the same page before moving forward.",
                    "The foundational modules are explained with extreme clarity. Great place to start your stock market journey.",
                    "Clear, jargon-free explanations that make beginners feel welcome and capable of learning market dynamics.",
                    "I was intimidated by market charts before, but Dhankranti made the basics simple and accessible.",
                    "Friendly environment for beginners with zero pressure. An ideal place to start learning about investing."
                ]
            },
            {
                "name": "Course Content",
                "description": "Structured curriculum covering technical & fundamental analysis.",
                "icon": "book-open",
                "reviews": [
                    "The course covers the important concepts in a structured way. I especially liked the combination of theory and practical examples.",
                    "Well-designed curriculum covering technical analysis, candlestick patterns, and risk management comprehensively.",
                    "The syllabus is organized logically, progressing smoothly from basic price action to advanced trend analysis.",
                    "Comprehensive course material that covers both short-term market analysis and long-term investment fundamentals.",
                    "Clear coverage of support-resistance, trendlines, chart patterns, and indicators with practical rules.",
                    "The study material and class notes are concise and very helpful for revision.",
                    "Loved the balance between technical tools and the psychological aspects of trading and discipline.",
                    "Everything from risk mitigation to entry-exit planning is included in the curriculum. Very complete syllabus.",
                    "Structured curriculum with zero fluff. Every topic taught has a direct application in reading market charts.",
                    "The content is updated with modern market scenarios, making the learning highly relevant."
                ]
            },
            {
                "name": "Live Market Sessions",
                "description": "Real-time market analysis and live session experience.",
                "icon": "activity",
                "reviews": [
                    "The live market sessions helped me understand how the concepts work in actual market situations.",
                    "Observing price movements during live market hours showed me how to apply chart analysis in real time.",
                    "Live market analysis sessions are where everything comes together. You see real-time price action as it happens.",
                    "Experiencing market volatility in live sessions under mentor guidance was an eye-opening learning experience.",
                    "Live market tracking helped me understand the importance of patience and waiting for setups to form.",
                    "Watching the mentors analyze live candles in real time provided practical insights that theory cannot teach.",
                    "The live practical sessions remove the fear of looking at fast-moving market charts.",
                    "Seeing how support and resistance react during market hours gave me a realistic perspective on trading.",
                    "Live market exposure is the standout feature of this course. It bridges the gap between learning and reality.",
                    "Analyzing live charts together in class helped me understand when to stay disciplined and when to act."
                ]
            },
            {
                "name": "Doubt Solving",
                "description": "Clear explanations for student questions and queries.",
                "icon": "message-circle-question",
                "reviews": [
                    "The doubt-solving sessions are very useful. Questions are explained clearly instead of simply giving the answer.",
                    "Every single question asked by students is addressed patiently with chart examples until doubts are cleared.",
                    "Dedicated doubt sessions ensure no student gets left behind. The mentors never rush through explanations.",
                    "I had multiple queries regarding stop-loss placement, and they were explained with multiple clear chart setups.",
                    "Great platform for asking questions without hesitation. The faculty ensures you understand the underlying concept.",
                    "Quick and thorough responses to all student queries during and after the classes.",
                    "Doubt clearing is handled with real chart examples, which makes the solution very easy to grasp.",
                    "The mentors stay back after class until every student's questions are resolved. Commendable dedication.",
                    "Appreciate the open doubt-clearing culture where even simple questions are respected and explained.",
                    "Regular revision and doubt sessions helped me solidify my understanding before moving to new topics."
                ]
            },
            {
                "name": "Overall Experience",
                "description": "General learning environment and overall institute value.",
                "icon": "star",
                "reviews": [
                    "Good learning experience with supportive guidance and practical explanations. I learned many concepts that were new to me.",
                    "A genuine, transparent, and professional institute for learning the stock market in Pune.",
                    "From the classroom ambiance to the mentor support, my entire learning journey at Dhankranti has been wonderful.",
                    "Highly recommend Dhankranti for anyone looking for honest, practical, and disciplined share market education.",
                    "A well-organized institute that focuses on realistic learning rather than unrealistic shortcuts.",
                    "Very positive learning environment. The focus on risk management and discipline sets this academy apart.",
                    "Great overall experience. I now have a structured method to analyze charts independently.",
                    "Polite staff, knowledgeable faculty, and clean facilities at the Pune center. Glad I enrolled here.",
                    "An enriching educational experience that gave me clarity on how the financial markets operate.",
                    "Dhankranti provides genuine value and practical guidance for anyone serious about stock market education."
                ]
            }
        ]

        target_cat_names = [c["name"] for c in target_categories]

        # Remove old categories not in the 8 target categories
        old_categories = list(db.categories.find())
        for oc in old_categories:
            if oc["name"] not in target_cat_names:
                db.review_templates.delete_many({"category_id": oc["_id"]})
                db.categories.delete_one({"_id": oc["_id"]})

        # Seed the 8 categories and 10 reviews each
        total_reviews_seeded = 0
        for cat_info in target_categories:
            cat = db.categories.find_one({"name": cat_info["name"]})
            if not cat:
                cat_doc = {
                    "name": cat_info["name"],
                    "description": cat_info["description"],
                    "icon": cat_info["icon"],
                    "is_active": True,
                    "created_at": now
                }
                result = db.categories.insert_one(cat_doc)
                cat_doc["_id"] = result.inserted_id
                cat = cat_doc
                print(f"Created category: {cat['name']}")
            else:
                db.categories.update_one(
                    {"_id": cat["_id"]},
                    {"$set": {
                        "description": cat_info["description"],
                        "icon": cat_info["icon"],
                        "is_active": True
                    }}
                )

            cat_id = cat["_id"]

            # Clear any outdated reviews for this category & shop to avoid duplicates
            db.review_templates.delete_many({
                "shop_id": shop_id,
                "category_id": cat_id
            })

            # Seed 10 reviews
            review_docs = []
            for rev_text in cat_info["reviews"]:
                review_docs.append({
                    "shop_id": shop_id,
                    "category_id": cat_id,
                    "review_text": rev_text,
                    "is_active": True,
                    "created_at": now,
                    "updated_at": now
                })
            if review_docs:
                db.review_templates.insert_many(review_docs)
                total_reviews_seeded += len(review_docs)

        print(f"Dhankranti seed completed! Exactly {len(target_categories)} categories and {total_reviews_seeded} review templates.")
        print(f"Shop: {shop['name']} (QR Token: {shop.get('qr_token', 'dhankranti')})")
        print(f"Customer URL: http://localhost:5173/r/{shop.get('qr_token', 'dhankranti')}")

    except Exception as e:
        print(f"Error seeding database: {e}")
        raise e
    finally:
        close_connection()

if __name__ == "__main__":
    seed_database()
