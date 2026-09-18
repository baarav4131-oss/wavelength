-- ============================================
-- MUSIC STREAMING PLATFORM
-- PL/SQL TRIGGERS
-- ============================================


-- 1. Automatically set playlist creation date
CREATE OR REPLACE TRIGGER trg_playlist_created_date
BEFORE INSERT ON playlist
FOR EACH ROW
BEGIN
    IF :NEW.created_date IS NULL THEN
        :NEW.created_date := SYSDATE;
    END IF;
END;
/


-- 2. Automatically set playlist visibility
CREATE OR REPLACE TRIGGER trg_playlist_visibility
BEFORE INSERT OR UPDATE ON playlist
FOR EACH ROW
BEGIN
    IF :NEW.visibility IS NULL THEN
        :NEW.visibility := 'PRIVATE';
    ELSE
        :NEW.visibility := UPPER(:NEW.visibility);
    END IF;
END;
/


-- 3. Automatically set payment date
CREATE OR REPLACE TRIGGER trg_payment_date
BEFORE INSERT ON payment
FOR EACH ROW
BEGIN
    IF :NEW.payment_date IS NULL THEN
        :NEW.payment_date := SYSDATE;
    END IF;
END;
/


-- 4. Validate subscription dates
CREATE OR REPLACE TRIGGER trg_subscription_dates
BEFORE INSERT OR UPDATE ON subscription
FOR EACH ROW
BEGIN
    IF :NEW.end_date IS NOT NULL
       AND :NEW.end_date < :NEW.start_date THEN
        RAISE_APPLICATION_ERROR(
            -20001,
            'Subscription end date cannot be before start date.'
        );
    END IF;
END;
/


-- 5. Validate song duration
CREATE OR REPLACE TRIGGER trg_song_duration
BEFORE INSERT OR UPDATE ON song
FOR EACH ROW
BEGIN
    IF :NEW.duration IS NOT NULL
       AND :NEW.duration <= 0 THEN
        RAISE_APPLICATION_ERROR(
            -20002,
            'Song duration must be greater than zero.'
        );
    END IF;
END;
/