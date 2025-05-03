CREATE FUNCTION get_confirmation_sent(user_email TEXT) RETURNS TEXT AS $$
    DECLARE 
        confirmation TEXT;
    BEGIN 
        SELECT confirmation_sent_at INTO confirmation
        FROM auth.users
        WHERE email = user_email;
        RETURN confirmation;
    END;
$$ LANGUAGE plpgsql;

create view public.users as select * from auth.users;
revoke all on public.users from anon, authenticated;
GRANT SELECT ON TABLE public.users TO service_role;

