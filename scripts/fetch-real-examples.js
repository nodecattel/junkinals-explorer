// Script to fetch real data for API documentation examples
const API_BASE_URL = "https://ord.junkiewally.xyz"
const EXAMPLE_ADDRESS = "7iWvZYWvnHr7ziyvHxotMTqpAwm7dSR8ns"

async function fetchRealExamples() {
  console.log("Fetching real data for API documentation examples...")
  console.log(`Using address: ${EXAMPLE_ADDRESS}`)

  let balanceData // Declare balanceData variable

  try {
    // 1. Fetch JUNK-20 balance for the address
    console.log("\n=== JUNK-20 Balance ===")
    const balanceResponse = await fetch(`${API_BASE_URL}/junk20/balance/${EXAMPLE_ADDRESS}`)
    if (balanceResponse.ok) {
      balanceData = await balanceResponse.json() // Assign balanceData
      console.log("JUNK-20 Balance Response:")
      console.log(JSON.stringify(balanceData, null, 2))
    } else {
      console.log(`Balance fetch failed: ${balanceResponse.status}`)
    }

    // 2. Fetch all junkscriptions to find ones owned by this address
    console.log("\n=== Finding Junkscriptions ===")
    const junkscriptionsResponse = await fetch(`${API_BASE_URL}/junkscriptions`)
    if (junkscriptionsResponse.ok) {
      const html = await junkscriptionsResponse.text()

      // Parse HTML to extract junkscription IDs
      const junkscriptionIds = []
      const matches = html.match(/href="\/junkscription\/([^"]+)"/g)
      if (matches) {
        matches.forEach((match) => {
          const id = match.match(/href="\/junkscription\/([^"]+)"/)[1]
          junkscriptionIds.push(id)
        })
      }

      console.log(`Found ${junkscriptionIds.length} total junkscriptions`)

      // Check first 10 junkscriptions for ownership
      const ownedJunkscriptions = []
      for (let i = 0; i < Math.min(10, junkscriptionIds.length); i++) {
        const id = junkscriptionIds[i]
        try {
          const detailResponse = await fetch(`${API_BASE_URL}/junkscription/${id}`)
          if (detailResponse.ok) {
            const detailHtml = await detailResponse.text()

            // Extract address from HTML
            const addressMatch = detailHtml.match(/<dt>address<\/dt>\s*<dd>([^<]+)<\/dd>/)
            if (addressMatch && addressMatch[1].trim() === EXAMPLE_ADDRESS) {
              // Extract other details
              const contentTypeMatch = detailHtml.match(/<dt>content type<\/dt>\s*<dd>([^<]+)<\/dd>/)
              const contentLengthMatch = detailHtml.match(/<dt>content length<\/dt>\s*<dd>([^<]+)<\/dd>/)
              const genesisHeightMatch = detailHtml.match(/<dt>genesis height<\/dt>\s*<dd>([^<]+)<\/dd>/)
              const timestampMatch = detailHtml.match(/<dt>timestamp<\/dt>\s*<dd>([^<]+)<\/dd>/)
              const outputValueMatch = detailHtml.match(/<dt>output value<\/dt>\s*<dd>([^<]+)<\/dd>/)
              const genesisFeeMatch = detailHtml.match(/<dt>genesis fee<\/dt>\s*<dd>([^<]+)<\/dd>/)
              const locationMatch = detailHtml.match(/<dt>location<\/dt>\s*<dd>([^<]+)<\/dd>/)

              ownedJunkscriptions.push({
                id,
                content_type: contentTypeMatch ? contentTypeMatch[1].trim() : "",
                content_length: contentLengthMatch ? contentLengthMatch[1].trim() : "",
                genesis_height: genesisHeightMatch ? genesisHeightMatch[1].trim() : "",
                timestamp: timestampMatch ? timestampMatch[1].trim() : "",
                address: EXAMPLE_ADDRESS,
                output_value: outputValueMatch ? outputValueMatch[1].trim() : "",
                genesis_fee: genesisFeeMatch ? genesisFeeMatch[1].trim() : "",
                location: locationMatch ? locationMatch[1].trim() : "",
              })
            }
          }

          // Small delay to be respectful
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
          console.log(`Error checking junkscription ${id}:`, error.message)
        }
      }

      console.log(`\nFound ${ownedJunkscriptions.length} junkscriptions owned by ${EXAMPLE_ADDRESS}:`)
      ownedJunkscriptions.forEach((j, index) => {
        console.log(`\n${index + 1}. Junkscription ${j.id}:`)
        console.log(`   Content Type: ${j.content_type}`)
        console.log(`   Content Length: ${j.content_length}`)
        console.log(`   Genesis Height: ${j.genesis_height}`)
        console.log(`   Timestamp: ${j.timestamp}`)
        console.log(`   Output Value: ${j.output_value}`)
        console.log(`   Genesis Fee: ${j.genesis_fee}`)
        console.log(`   Location: ${j.location}`)
      })

      // Generate example API responses
      console.log("\n=== Generated API Response Examples ===")

      // Address summary response
      const addressSummaryResponse = {
        address: EXAMPLE_ADDRESS,
        junkscriptions_count: ownedJunkscriptions.length,
        junk20_tokens_count: balanceData?.junk20?.length || 0,
        total_transactions: Math.max(ownedJunkscriptions.length * 2, 5),
        first_seen_block:
          ownedJunkscriptions.length > 0
            ? Math.min(...ownedJunkscriptions.map((j) => Number.parseInt(j.genesis_height) || 0))
            : 0,
        last_activity_block:
          ownedJunkscriptions.length > 0
            ? Math.max(...ownedJunkscriptions.map((j) => Number.parseInt(j.genesis_height) || 0))
            : 0,
        has_assets: ownedJunkscriptions.length > 0 || (balanceData?.junk20?.length || 0) > 0,
      }

      console.log("\nAddress Summary Response:")
      console.log(JSON.stringify(addressSummaryResponse, null, 2))

      // Address assets response (comprehensive - includes both junkscriptions and JUNK-20)
      const addressAssetsResponse = {
        address: EXAMPLE_ADDRESS,
        junkscriptions: {
          count: ownedJunkscriptions.length,
          items: ownedJunkscriptions.map((j) => ({
            id: j.id,
            content_type: j.content_type,
            content_length: Number.parseInt(j.content_length) || 0,
            genesis_height: Number.parseInt(j.genesis_height) || 0,
            genesis_timestamp: Math.floor(new Date(j.timestamp).getTime() / 1000) || 0,
            inscription_number: Number.parseInt(j.id.match(/i(\d+)$/)?.[1]) || 0,
          })),
        },
        junk20: {
          count: balanceData?.junk20?.length || 0,
          items: balanceData?.junk20 || [],
        },
      }

      console.log("\nAddress Assets Response (Comprehensive):")
      console.log(JSON.stringify(addressAssetsResponse, null, 2))
    } else {
      console.log(`Junkscriptions fetch failed: ${junkscriptionsResponse.status}`)
    }

    // 3. Fetch current block info
    console.log("\n=== Current Block Info ===")
    const blockCountResponse = await fetch(`${API_BASE_URL}/block-count`)
    if (blockCountResponse.ok) {
      const blockCount = await blockCountResponse.text()
      console.log(`Current block height: ${blockCount.trim()}`)

      // Fetch block details
      const blockResponse = await fetch(`${API_BASE_URL}/block/${blockCount.trim()}`)
      if (blockResponse.ok) {
        const blockData = await blockResponse.json()
        console.log("Current Block Details:")
        console.log(JSON.stringify(blockData, null, 2))
      }
    }
  } catch (error) {
    console.error("Error fetching real examples:", error)
  }
}

// Run the script
fetchRealExamples()
