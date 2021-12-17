if (typeof window !== "undefined") {
  exports["GraphQLClient"] =
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("graphql-request").GraphQLClient
} else {
  exports["GraphQLClient"] = null
}
