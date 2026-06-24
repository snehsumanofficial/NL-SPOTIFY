import re

with open('app.py', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '# TAB 0: AI REVIEW ANALYZER'
end_marker = '# TAB 1: INSIGHT DASHBOARD'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

actual_start = content.rfind('# ==========================================', 0, start_idx + len(start_marker) + 1)
actual_end = content.find('# ==========================================', actual_start + 10)

replacement = """# ==========================================
# TAB 0: AI REVIEW ANALYZER
# ==========================================
with tab0:
    st.markdown('''
        <div style='text-align: center; margin-bottom: 30px;'>
            <h1 style='color: #a482ff;'>PROJECT A: AI REVIEW ANALYZER</h1>
            <h3 style='color: #cccccc; font-weight: 300;'>Turn thousands of user reviews into actionable product insights</h3>
        </div>
    ''', unsafe_allow_html=True)
    
    st.markdown('''
        <div style='display: flex; justify-content: space-between; background-color: #121212; padding: 20px; border-radius: 10px; margin-bottom: 40px; border: 1px solid #333;'>
            <div style='text-align: center;'><h3 style='color: #a482ff; margin-bottom: 5px;'>☁️ Collect</h3><p style='color: #aaa; font-size: 14px;'>Gather reviews from multiple platforms at scale</p></div>
            <div style='text-align: center;'><h3 style='color: #a482ff; margin-bottom: 5px;'>🧠 Analyze</h3><p style='color: #aaa; font-size: 14px;'>AI classifiers extracts insights, sentiment, and themes</p></div>
            <div style='text-align: center;'><h3 style='color: #a482ff; margin-bottom: 5px;'>🔍 Discover</h3><p style='color: #aaa; font-size: 14px;'>Uncover real pain points, unmet needs and opportunities</p></div>
            <div style='text-align: center;'><h3 style='color: #a482ff; margin-bottom: 5px;'>🎯 Decide</h3><p style='color: #aaa; font-size: 14px;'>Data-backed insights to build the right products</p></div>
        </div>
    ''', unsafe_allow_html=True)
    
    st.info("**GOAL:** Understand why users struggle with music discovery on Spotify and identify the biggest opportunities for Growth.")
    st.markdown("---")
    
    col1, col2 = st.columns([1, 1.2])
    
    with col1:
        st.subheader("1. DATA SOURCES")
        st.markdown("We collect reviews and discussions from everywhere users express feedback")
        
        data_sources = pd.DataFrame({
            "Platform": ["App Store Reviews", "Google Play Reviews", "Reddit Discussions", "Spotify Community", "X (Twitter) Mentions", "YouTube Comments"],
            "Description": ["iOS reviews & ratings", "Android reviews & ratings", "r/spotify, r/music, r/listentothis", "Community ideas & feedback", "Tweets & replies about Spotify", "Comments on Spotify videos"],
            "Count": ["12,842", "18,731", "8,612", "2,104", "15,562", "6,943"]
        })
        st.dataframe(data_sources, use_container_width=True, hide_index=True)
        st.markdown("**Total Raw Items Collected: 64,794**")
        
    with col2:
        st.subheader("2. INGESTION & PROCESSING PIPELINE")
        st.markdown("Automated pipeline to clean, structure and prepare data for AI analysis")
        
        st.markdown('''
        <div style='display: flex; justify-content: space-between; background-color: #181818; padding: 20px; border-radius: 10px; margin-top: 20px; border: 1px solid #333;'>
            <div style='text-align: center; width: 18%;'><h2 style='margin:0;'>📥</h2><b>Collect</b><p style='font-size:12px;color:#aaa;'>Fetch reviews via APIs & scrapers</p></div>
            <div style='text-align: center; width: 5%; padding-top: 20px;'>➡️</div>
            <div style='text-align: center; width: 18%;'><h2 style='margin:0;'>🧹</h2><b>Clean</b><p style='font-size:12px;color:#aaa;'>Remove duplicates, spam, irrelevant content</p></div>
            <div style='text-align: center; width: 5%; padding-top: 20px;'>➡️</div>
            <div style='text-align: center; width: 18%;'><h2 style='margin:0;'>📄</h2><b>Normalize</b><p style='font-size:12px;color:#aaa;'>Standardize text, language detection</p></div>
            <div style='text-align: center; width: 5%; padding-top: 20px;'>➡️</div>
            <div style='text-align: center; width: 18%;'><h2 style='margin:0;'>🧩</h2><b>Chunk</b><p style='font-size:12px;color:#aaa;'>Break long posts into meaningful chunks</p></div>
            <div style='text-align: center; width: 5%; padding-top: 20px;'>➡️</div>
            <div style='text-align: center; width: 18%;'><h2 style='margin:0;'>🗄️</h2><b>Store</b><p style='font-size:12px;color:#aaa;'>Store in vector DB for semantic analysis</p></div>
        </div>
        ''', unsafe_allow_html=True)
        st.caption("**Tech Used:** n8n (Orchestration) • Python • OpenAI GPT-4o • Pinecone (Vector DB) • PostgreSQL")

    st.markdown("---")
    
    st.subheader("3. AI ANALYSIS OF EACH REVIEW")
    st.markdown("Each review is analyzed by GPT-4o using a structured prompt")
    
    c3_1, c3_2 = st.columns([1, 1.5])
    with c3_1:
        st.markdown("<div class='card' style='border: 1px solid #a482ff;'>", unsafe_allow_html=True)
        st.markdown("**INPUT (Raw Review)**")
        st.markdown("*Spotify keeps recommending the same artists and playlists. Discovery feels repetitive and boring now. I end up using YouTube to find new music.*")
        st.markdown("<br><span style='color:#aaa; font-size: 12px;'>Platform: App Store • Rating: 2⭐ • Date: 18 Jun 2026</span>", unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)
        
    with c3_2:
        st.markdown("<div class='card'>", unsafe_allow_html=True)
        st.markdown("**AI OUTPUT (Structured Insight)**")
        out_data = {
            "Field": ["Pain Point", "Sentiment", "User Goal", "User Segment", "Discovery Related?", "Recommendation Related?", "Root Cause", "Opportunity Area"],
            "Value": ["Repetitive recommendations", "Negative", "Discover new & diverse music", "Long-term Premium User", "Yes", "Yes", "Algorithm over-favors familiarity", "Discovery"]
        }
        st.table(pd.DataFrame(out_data))
        st.markdown("</div>", unsafe_allow_html=True)

    st.markdown("---")
    
    st.subheader("4. BULK ANALYSIS RESULTS")
    st.markdown("All reviews are processed and structured for aggregation. **64,794 reviews -> 64,122 analyzed items** (after cleaning & deduplication)")
    
    bulk_data = pd.DataFrame({
        "Review (Shortened)": [
            "Keeps recommending the same artists...",
            "Too many ads. Can't even pick songs...",
            "I want more underground artists...",
            "Spotify doesn't surprise me anymore...",
            "Hard to find regional language songs...",
            "Premium is expensive for what we get."
        ],
        "Platform": ["App Store", "Google Play", "Reddit", "YouTube", "X (Twitter)", "App Store"],
        "Sentiment": ["Negative", "Negative", "Negative", "Negative", "Negative", "Negative"],
        "Pain Point": ["Repetitive recommendations", "Excessive ads & restrictions", "Lack of hidden gems", "Predictable recommendations", "Difficult to discover regional music", "Premium value concern"],
        "Segment": ["Long-term Premium User", "Free User", "Music Enthusiast", "Premium User", "Regional Listener", "Premium User"],
        "Opportunity Area": ["Discovery", "Premium Value", "Hidden Gems", "Discovery", "Regional Discovery", "Premium Value"]
    })
    st.dataframe(bulk_data, use_container_width=True, hide_index=True)

    st.markdown("---")
    
    st.subheader("5. THEME CLUSTERING")
    st.markdown("AI groups similar pain points into major themes using semantic clustering.")
    
    t1, t2, t3 = st.columns(3)
    t4, t5, t6 = st.columns(3)
    
    with t1:
        st.markdown("<div class='card' style='border-top: 4px solid #ff4b4b; text-align: center;'><h1 style='margin:0;'>🔄</h1><h4>Repetitive Recommendations</h4><h2 style='color:#ff4b4b;'>33.9%</h2><p style='color:#aaa;'>21,756 reviews</p></div>", unsafe_allow_html=True)
    with t2:
        st.markdown("<div class='card' style='border-top: 4px solid #ffa500; text-align: center;'><h1 style='margin:0;'>🔍</h1><h4>Hard Discovery / Lack of Hidden Gems</h4><h2 style='color:#ffa500;'>26.3%</h2><p style='color:#aaa;'>16,842 reviews</p></div>", unsafe_allow_html=True)
    with t3:
        st.markdown("<div class='card' style='border-top: 4px solid #00c0f2; text-align: center;'><h1 style='margin:0;'>💎</h1><h4>Premium Value Concerns</h4><h2 style='color:#00c0f2;'>15.2%</h2><p style='color:#aaa;'>9,731 reviews</p></div>", unsafe_allow_html=True)
    with t4:
        st.markdown("<div class='card' style='border-top: 4px solid #1DB954; text-align: center;'><h1 style='margin:0;'>🚫</h1><h4>Excessive Ads & Limitations</h4><h2 style='color:#1DB954;'>13.9%</h2><p style='color:#aaa;'>8,912 reviews</p></div>", unsafe_allow_html=True)
    with t5:
        st.markdown("<div class='card' style='border-top: 4px solid #a482ff; text-align: center;'><h1 style='margin:0;'>🌍</h1><h4>Regional Music Discovery</h4><h2 style='color:#a482ff;'>7.3%</h2><p style='color:#aaa;'>4,671 reviews</p></div>", unsafe_allow_html=True)
    with t6:
        st.markdown("<div class='card' style='border-top: 4px solid #888; text-align: center;'><h1 style='margin:0;'>💬</h1><h4>Other UX Issues (Search, Bugs, etc.)</h4><h2 style='color:#888;'>3.4%</h2><p style='color:#aaa;'>2,210 reviews</p></div>", unsafe_allow_html=True)

    st.markdown("---")
    
    st.subheader("6. SENTIMENT DISTRIBUTION")
    st.markdown("Overall sentiment across all analyzed reviews")
    
    s_col1, s_col2 = st.columns([1, 2])
    with s_col1:
        sentiment_df = pd.DataFrame({"Sentiment": ["Negative", "Neutral", "Positive"], "Count": [39803, 13912, 10407]})
        fig_donut = px.pie(sentiment_df, values='Count', names='Sentiment', hole=0.6, color='Sentiment', 
                           color_discrete_map={'Negative':'#ff4b4b', 'Neutral':'#ffa500', 'Positive':'#1DB954'})
        fig_donut.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)', margin=dict(t=0, b=0, l=0, r=0))
        st.plotly_chart(fig_donut, use_container_width=True)
    with s_col2:
        st.markdown("<br><br>", unsafe_allow_html=True)
        st.markdown("**Key Takeaway:**")
        st.info("Majority of reviews (62.1%) are negative and strongly related to discovery and recommendation experience.")

    st.markdown("---")
    
    st.subheader("7. USER SEGMENT INSIGHTS")
    st.markdown("Which user segments face the biggest discovery issues?")
    
    seg_col1, seg_col2 = st.columns([2, 1])
    with seg_col1:
        segment_df = pd.DataFrame({
            "Segment": ["Long-term Premium Users (2+ yrs)", "Music Enthusiasts", "Students", "Casual Listeners", "Free Users"],
            "Percentage": [38, 24, 16, 13, 9]
        })
        fig_bar = px.bar(segment_df, x='Percentage', y='Segment', orientation='h', color_discrete_sequence=['#a482ff'])
        fig_bar.update_layout(yaxis={'categoryorder':'total ascending'}, plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)', margin=dict(t=0, b=0, l=0, r=0))
        st.plotly_chart(fig_bar, use_container_width=True)
    with seg_col2:
        st.markdown("<br><br>", unsafe_allow_html=True)
        st.markdown("**Key Takeaway:**")
        st.info("Long-term Premium Users are the most frustrated segment, primarily complaining about repetitive recommendations and lack of discovery.")

    st.markdown("---")
    
    st.subheader("8. OPPORTUNITY PRIORITIZATION")
    st.markdown("Opportunities ranked by Impact vs Effort")
    
    opp_df = pd.DataFrame({
        "Opportunity": ["Better Discovery Feed", "Discovery Slider", "Reject / Don't Recommend", "AI Discovery Copilot", "Hidden Gems Mode", "Studio Mode", "Improved Search Filters", "Better Onboarding", "Personalization 2.0", "Social Discovery 2.0"],
        "Effort": [2, 3, 2, 8, 7, 9, 2, 3, 8, 9],
        "Impact": [8, 7, 9, 9, 8, 7, 3, 4, 3, 4],
        "Category": ["Quick Wins", "Quick Wins", "Quick Wins", "Major Bets", "Major Bets", "Major Bets", "Fill-Ins", "Fill-Ins", "Long-term Bets", "Long-term Bets"]
    })
    
    fig_scatter = px.scatter(opp_df, x="Effort", y="Impact", color="Category", text="Opportunity",
                             color_discrete_map={"Quick Wins": "#1DB954", "Major Bets": "#a482ff", "Fill-Ins": "#ffa500", "Long-term Bets": "#ff4b4b"})
    fig_scatter.update_traces(textposition='top center')
    fig_scatter.add_hline(y=5, line_dash="dash", line_color="gray")
    fig_scatter.add_vline(x=5, line_dash="dash", line_color="gray")
    fig_scatter.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)', xaxis_range=[0,10], yaxis_range=[0,10])
    st.plotly_chart(fig_scatter, use_container_width=True)

    st.markdown("---")
    
    st.subheader("9. INSIGHTS DASHBOARD")
    st.markdown("Real-time dashboard for PMs and Growth team")
    
    st.markdown('''
        <div style='background-color: #121212; padding: 30px; border-radius: 15px; border: 1px solid #333;'>
            <h2 style='margin-top: 0;'>OVERVIEW</h2>
            <div style='display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 20px;'>
                <div>
                    <p style='color: #aaa; margin: 0;'>Total Reviews Analyzed</p>
                    <h1 style='margin: 0; color: white;'>64,122</h1>
                </div>
                <div>
                    <p style='color: #aaa; margin: 0;'>Negative Sentiment</p>
                    <h1 style='margin: 0; color: #ff4b4b;'>62.1%</h1>
                </div>
                <div>
                    <p style='color: #aaa; margin: 0;'>Top Theme</p>
                    <h3 style='margin: 0; color: white;'>Repetitive Recommendations</h3>
                </div>
                <div>
                    <p style='color: #aaa; margin: 0;'>Top Segment</p>
                    <h3 style='margin: 0; color: white;'>Long-term Premium Users</h3>
                </div>
            </div>
            
            <div style='display: flex; justify-content: space-between;'>
                <div style='width: 45%;'>
                    <h4 style='color: #aaa;'>Top Themes</h4>
                    <p style='color: #ff4b4b; margin: 5px 0;'>Repetitive Recommendations <span style='float:right;'>33.9%</span></p>
                    <div style='width: 100%; background: #333; height: 8px; border-radius: 4px;'><div style='width: 33.9%; background: #ff4b4b; height: 100%; border-radius: 4px;'></div></div>
                    <p style='color: #ffa500; margin: 5px 0; margin-top: 15px;'>Hard Discovery <span style='float:right;'>26.2%</span></p>
                    <div style='width: 100%; background: #333; height: 8px; border-radius: 4px;'><div style='width: 26.2%; background: #ffa500; height: 100%; border-radius: 4px;'></div></div>
                    <p style='color: #00c0f2; margin: 5px 0; margin-top: 15px;'>Premium Value Concerns <span style='float:right;'>15.2%</span></p>
                    <div style='width: 100%; background: #333; height: 8px; border-radius: 4px;'><div style='width: 15.2%; background: #00c0f2; height: 100%; border-radius: 4px;'></div></div>
                </div>
                <div style='width: 45%;'>
                    <h4 style='color: #aaa;'>Recent Pain Points</h4>
                    <ul style='color: white; line-height: 1.8;'>
                        <li>"Same songs again and again" - <span style='color: #aaa;'>App Store</span></li>
                        <li>"Not discovering new artists" - <span style='color: #aaa;'>Reddit</span></li>
                        <li>"Too many ads" - <span style='color: #aaa;'>Google Play</span></li>
                        <li>"Premium not worth it" - <span style='color: #aaa;'>App Store</span></li>
                        <li>"Hard to find regional music" - <span style='color: #aaa;'>Community</span></li>
                    </ul>
                </div>
            </div>
        </div>
    ''', unsafe_allow_html=True)
    
    st.markdown("<br><br><br><div style='text-align: center;'><h3 style='color: #1DB954;'>🎯 OUTCOME</h3><p>The Review Analyzer helps us understand REAL user problems and uncover <b>HIGH-IMPACT</b> opportunities to drive meaningful music discovery.</p></div>", unsafe_allow_html=True)

"""

new_content = content[:actual_start] + replacement + '\n' + content[actual_end:]

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(new_content)
