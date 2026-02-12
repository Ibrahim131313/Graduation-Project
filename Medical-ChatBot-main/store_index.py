# Embeddings and store in Pinecone

from dotenv import load_dotenv
import os
from src.helper import load_pdf_files, filter_to_minimal_docs, text_split, download_embeddings
from pinecone import Pinecone
from pinecone import ServerlessSpec
from langchain_pinecone import PineconeVectorStore

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GROC_API_KEY = os.getenv("GROC_API_KEY")

os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY
os.environ["GROC_API_KEY"] = GROC_API_KEY

extracted_data = load_pdf_files(data='data/')
minimal_docs = filter_to_minimal_docs(extracted_data)
text_chunks = text_split(minimal_docs)


embeddings = download_embeddings()

Pinecone_api_key = PINECONE_API_KEY
pc = Pinecone(api_key=Pinecone_api_key)




index_name = "medical-chatbot"

# Only create the index if it does not already exist
if  not pc.has_index(index_name):
    pc.create_index(
        name=index_name,
        dimension=384, # Dimension of the embedding model
        metric="cosine", # Similarity metric
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )

# Connect to the existing index
index = pc.Index(index_name)


docsearch = PineconeVectorStore.from_documents(
    documents=text_chunks,
    embedding=embeddings,
    index_name=index_name
)
