-- ============================================
-- MUSIC STREAMING PLATFORM
-- PL/SQL FUNCTIONS
-- ============================================


-- 1. GET TOTAL NUMBER OF SONGS
CREATE OR REPLACE FUNCTION get_total_songs
RETURN NUMBER
AS
    v_total NUMBER;
BEGIN
    SELECT COUNT(*)
    INTO v_total
    FROM song;

    RETURN v_total;
END;
/


-- 2. GET NUMBER OF SONGS IN A PLAYLIST
CREATE OR REPLACE FUNCTION get_playlist_song_count (
    p_playlist_id IN NUMBER
)
RETURN NUMBER
AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM playlist_song
    WHERE playlist_id = p_playlist_id;

    RETURN v_count;
END;
/


-- 3. GET NUMBER OF FOLLOWERS FOR AN ARTIST
CREATE OR REPLACE FUNCTION get_artist_follower_count (
    p_artist_id IN NUMBER
)
RETURN NUMBER
AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM user_artist
    WHERE artist_id = p_artist_id;

    RETURN v_count;
END;
/


-- 4. GET USER'S CURRENT SUBSCRIPTION PLAN
CREATE OR REPLACE FUNCTION get_user_plan (
    p_user_id IN NUMBER
)
RETURN VARCHAR2
AS
    v_plan subscription.plan_type%TYPE;
BEGIN
    SELECT plan_type
    INTO v_plan
    FROM (
        SELECT plan_type
        FROM subscription
        WHERE user_id = p_user_id
        ORDER BY start_date DESC
    )
    WHERE ROWNUM = 1;

    RETURN v_plan;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 'NO ACTIVE PLAN';
END;
/


-- 5. CALCULATE TOTAL PAYMENT MADE BY A USER
CREATE OR REPLACE FUNCTION get_total_payment (
    p_user_id IN NUMBER
)
RETURN NUMBER
AS
    v_total NUMBER;
BEGIN
    SELECT NVL(SUM(amount), 0)
    INTO v_total
    FROM payment
    WHERE user_id = p_user_id;

    RETURN v_total;
END;
/