-- ============================================
-- MUSIC STREAMING PLATFORM
-- PL/SQL PROCEDURES
-- ============================================


-- 1. REGISTER A NEW USER
CREATE OR REPLACE PROCEDURE register_user (
    p_first_name  IN VARCHAR2,
    p_middle_name IN VARCHAR2 DEFAULT NULL,
    p_last_name   IN VARCHAR2 DEFAULT NULL,
    p_email       IN VARCHAR2,
    p_phone_no    IN VARCHAR2 DEFAULT NULL,
    p_gender      IN VARCHAR2 DEFAULT NULL,
    p_dob         IN DATE DEFAULT NULL
)
AS
BEGIN
    INSERT INTO app_user (
        first_name,
        middle_name,
        last_name,
        email,
        phone_no,
        gender,
        dob
    )
    VALUES (
        p_first_name,
        p_middle_name,
        p_last_name,
        p_email,
        p_phone_no,
        p_gender,
        p_dob
    );

    COMMIT;

    DBMS_OUTPUT.PUT_LINE('User registered successfully.');
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error: Email already exists.');
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/


-- 2. CREATE A PLAYLIST
CREATE OR REPLACE PROCEDURE create_playlist (
    p_user_id       IN NUMBER,
    p_playlist_name IN VARCHAR2,
    p_visibility    IN VARCHAR2 DEFAULT 'PRIVATE'
)
AS
BEGIN
    INSERT INTO playlist (
        user_id,
        playlist_name,
        visibility
    )
    VALUES (
        p_user_id,
        p_playlist_name,
        UPPER(p_visibility)
    );

    COMMIT;

    DBMS_OUTPUT.PUT_LINE('Playlist created successfully.');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/


-- 3. ADD A SONG TO A PLAYLIST
CREATE OR REPLACE PROCEDURE add_song_to_playlist (
    p_playlist_id IN NUMBER,
    p_song_id     IN NUMBER
)
AS
BEGIN
    INSERT INTO playlist_song (
        playlist_id,
        song_id
    )
    VALUES (
        p_playlist_id,
        p_song_id
    );

    COMMIT;

    DBMS_OUTPUT.PUT_LINE('Song added to playlist.');
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Song is already in this playlist.');
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/


-- 4. FOLLOW AN ARTIST
CREATE OR REPLACE PROCEDURE follow_artist (
    p_user_id   IN NUMBER,
    p_artist_id IN NUMBER
)
AS
BEGIN
    INSERT INTO user_artist (
        user_id,
        artist_id
    )
    VALUES (
        p_user_id,
        p_artist_id
    );

    COMMIT;

    DBMS_OUTPUT.PUT_LINE('Artist followed successfully.');
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('You are already following this artist.');
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/


-- 5. SUBSCRIBE A USER
CREATE OR REPLACE PROCEDURE subscribe_user (
    p_user_id   IN NUMBER,
    p_plan_type IN VARCHAR2,
    p_start_date IN DATE,
    p_end_date   IN DATE DEFAULT NULL
)
AS
BEGIN
    INSERT INTO subscription (
        user_id,
        plan_type,
        start_date,
        end_date
    )
    VALUES (
        p_user_id,
        p_plan_type,
        p_start_date,
        p_end_date
    );

    COMMIT;

    DBMS_OUTPUT.PUT_LINE('Subscription created successfully.');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/

CREATE OR REPLACE PROCEDURE unfollow_artist (
    p_user_id   NUMBER,
    p_artist_id NUMBER
)
AS
BEGIN
    DELETE FROM user_artist
    WHERE user_id = p_user_id
      AND artist_id = p_artist_id;

    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(
            -20001,
            'Artist is not currently followed'
        );
    END IF;

    COMMIT;
END;
/CREATE OR REPLACE PROCEDURE unfollow_artist (
    p_user_id   NUMBER,
    p_artist_id NUMBER
)
AS
BEGIN
    DELETE FROM user_artist
    WHERE user_id = p_user_id
      AND artist_id = p_artist_id;

    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(
            -20001,
            'Artist is not currently followed'
        );
    END IF;

    COMMIT;
END;
/
SET SQLBLANKLINES ON;

CREATE OR REPLACE PROCEDURE make_payment (
    p_user_id         NUMBER,
    p_subscription_id NUMBER,
    p_amount          NUMBER,
    p_payment_mode    VARCHAR2
)
AS
BEGIN
    INSERT INTO payment (
        user_id,
        subscription_id,
        amount,
        payment_mode,
        payment_date
    )
    VALUES (
        p_user_id,
        p_subscription_id,
        p_amount,
        p_payment_mode,
        SYSDATE
    );

    COMMIT;
END;
/
BEGIN
    make_payment(
        61,
        21,
        999,
        'CARD'
    );
END;
/