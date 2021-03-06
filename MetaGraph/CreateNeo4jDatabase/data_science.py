# Import libraries
from neo4j import GraphDatabase
import time

# Start time - Just to count how much the script lasts
start_time = time.time()

# URL of the Neo4j Server
uri = "bolt://localhost:7687"
# Driver to connect to the Server with the author and the password
# To be able to use it, you need to open your neo4j server before
driver = GraphDatabase.driver(uri, auth=("neo4j", "1234"))

def graph():
    with driver.session() as session:
        # Remove nodes with no interactions
        session.run("""
            MATCH (n)
            WHERE size((n)--())=0
            DELETE (n)
            """)
        
        session.run("""
            LOAD CSV WITH HEADERS FROM "file:///InferedTools.csv" AS csv
            match (i:InferedTool) where i.label = csv.label and csv.node_type = "Database"
            WITH collect(i) AS databases
            CALL apoc.refactor.rename.label("InferedTool", "Database", databases)
            YIELD committedOperations
            RETURN committedOperations
            """)
        # Remove previous nodes and edges
        session.run("""MATCH ()-[r:METAOCCUR_COMM]->() DELETE r""")
        session.run("""MATCH ()-[r:HAS_COMMUNITY]->() DELETE r""")
        session.run("""MATCH (r:Community) DELETE r""")
        
        print("Creating view")
        ### PageRank
        # Create view with the property
        session.run("""
            CALL gds.graph.create(
            'got-weighted-interactions',
            ['InferedTool', 'Publication', 'Database'],
            {
                METAOCCUR_ALL: {
                    orientation: 'UNDIRECTED',
                    aggregation: 'NONE',
                    properties: {
                        times: {
                        property: 'times',
                        aggregation: 'NONE',
                        defaultValue: 0.0
                        }
                    }
                }
            }
            )
            """)
        print("PageRank")
        # Write PageRank values to each node
        session.run("""
            CALL gds.pageRank.write(
                'got-weighted-interactions', 
                {
                    relationshipWeightProperty: 'times',
                    writeProperty: 'pageRank'
                }
            )
            """)
        print("Louvain")
        # Write the community id to each node
        session.run("""
            CALL gds.louvain.write(
                'got-weighted-interactions',
                {
                    relationshipWeightProperty: 'times',
                    writeProperty: 'community'
                }
            )
            """)

        print("Create clusters for all dataset")
        # Create clusters as nodes
        session.run("""
            MATCH (n) 
            WITH distinct n.community as com
            CREATE (:Community {com_id: com})
            """)
        # Edges between nodes and its communities
        session.run("""
            MATCH (n),(i:Community) 
            WHERE n.community = i.com_id
            CREATE (n)-[:HAS_COMMUNITY]->(i)
            """)
        session.run("""
            MATCH (c2:Community)<-[h2:HAS_COMMUNITY]-(p)-[m:METAOCCUR_ALL]-(n)-[h:HAS_COMMUNITY]->(c1:Community)
            WHERE c1<> c2
            WITH c2,c1, collect(m) as co
                UNWIND co as c 
            WITH c2, sum(c.times) as sumo , c1
            CREATE (c1)-[:METAOCCUR_COMM {times: sumo}]->(c2)
            """)
        # Delete duplicated and reversed relationships
        session.run("""
            Match (c1:Community)-[r:METAOCCUR_COMM]->(c2:Community)
            where c1.com_id < c2.com_id
            delete r
            """)

        #################### Create community properties #######################
    
        ### Add most common topics in the communities
        # Empty topic for all the communities
        session.run("""
            MATCH (n:Community)
            set n.mtopic=NULL, n.ctopic=NULL
            return n.mtopic,n.ctopic
            """)
        # Topics for communities bigger than 1
        session.run("""
            MATCH (n:Community)-[h:METAOCCUR_COMM]-(q:Community)
            with n, collect(h) as ch
            where size(ch) >1
            with collect(n) as cn
            unwind cn as c
            with c
            Match (l:Keyword)<-[:TOPIC]-(i:InferedTool)-[:HAS_COMMUNITY]->(c)
            with c,l,count(i) as counti
            order by counti DESC
            with c,collect(l)[0] as mlanguage, max(counti) as maxcount
            set c.mtopic=mlanguage.label, c.ctopic=id(mlanguage)
            return c,mlanguage, maxcount
            """)
        ### Add most common languages in the communities
        # Empty language for all the communities
        session.run("""
            MATCH (n:Community)
            set n.mlanguage=NULL, n.clanguage=NULL
            return n.mtopic,n.ctopic
            """)
        # Languages for communities bigger than 1
        session.run("""
            MATCH (n:Community)-[h:METAOCCUR_COMM]-(q:Community)
            with n, collect(h) as ch
            where size(ch) >1
            with collect(n) as cn
            unwind cn as c
            with c
            Match (l:Language)<-[:USE_LANGUAGE]-(i:InferedTool)-[:HAS_COMMUNITY]->(c)
            with c,l,count(i) as counti
            order by counti DESC
            with c,collect(l)[0] as mlanguage, max(counti) as maxcount
            set c.mlanguage=mlanguage.name, c.clanguage=id(mlanguage)
            return c,mlanguage, maxcount
            """)
        ### Add most common Operative system in the community
        # Empty OS for all the communities
        session.run("""
            MATCH (n:Community)
            set n.mos=NULL, n.cos=NULL
            return n.mtopic,n.ctopic
            """)
        # OS for communities bigger than 1
        session.run("""
            MATCH (n:Community)-[h:METAOCCUR_COMM]-(q:Community)
            with n, collect(h) as ch
            where size(ch) >1
            with collect(n) as cn
            unwind cn as c
            with c
            Match (l:OS)<-[:USE_OS]-(i:InferedTool)-[:HAS_COMMUNITY]->(c)
            with c,l,count(i) as counti
            order by counti DESC
            with c,collect(l)[0] as mlanguage, max(counti) as maxcount
            set c.mos=mlanguage.name, c.cos=id(mlanguage)
            return c,mlanguage, maxcount
            """)
    
        #Remove previous graphs
        session.run("""
            CALL gds.graph.drop('got-weighted-interactions')
        """)
        


if __name__ == '__main__':
    graph()
    print("--- %s seconds ---" % (time.time() - start_time))
