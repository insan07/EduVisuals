const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testDb() {
  console.log("Testing Supabase Connection...");
  
  // Try fetching profiles
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(5);
  if (pError) {
    console.error("Error fetching profiles:", pError);
  } else {
    console.log("Profiles data:", profiles);
  }

  // Try fetching images
  const { data: images, error: iError } = await supabase.from('images').select('*').limit(5);
  if (iError) {
    console.error("Error fetching images:", iError);
  } else {
    console.log("Images data:", images);
  }
}

testDb();
